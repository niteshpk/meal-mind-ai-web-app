import { Router, Response } from "express";
import { Recipe } from "../models/Recipe";
import { CustomRecipe } from "../models/CustomRecipe";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { Recipe as RecipeType } from "../types";

const router: Router = Router();

/**
 * POST /api/custom-recipes
 * Create a custom recipe (modified version of existing recipe)
 */
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      originalRecipeId,
      name,
      description,
      cuisine,
      prepTime,
      cookTime,
      servings,
      difficulty,
      ingredients,
      instructions,
      tips,
      customNotes,
    } = req.body;

    // Validate required fields
    if (!name || !description || !cuisine || !ingredients || !instructions) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // If originalRecipeId provided, verify it exists
    if (originalRecipeId) {
      const original = await Recipe.findById(originalRecipeId);
      if (!original) {
        return res.status(404).json({
          success: false,
          error: "Original recipe not found",
        });
      }
    }

    const customRecipe = new CustomRecipe({
      userId,
      originalRecipeId: originalRecipeId || undefined,
      name,
      description,
      cuisine,
      prepTime: prepTime || "0 min",
      cookTime: cookTime || "0 min",
      servings: servings || 4,
      difficulty: difficulty || "Medium",
      ingredients,
      instructions,
      tips: tips || [],
      customNotes: customNotes || undefined,
    });

    await customRecipe.save();

    res.status(201).json({
      success: true,
      recipe: customRecipe,
    });
  } catch (error) {
    console.error("Error creating custom recipe:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create custom recipe",
    });
  }
});

/**
 * PUT /api/custom-recipes/:id
 * Update a custom recipe
 */
router.put("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const customRecipe = await CustomRecipe.findOne({
      _id: id,
      userId,
    });

    if (!customRecipe) {
      return res.status(404).json({
        success: false,
        error: "Custom recipe not found or access denied",
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      "name",
      "description",
      "cuisine",
      "prepTime",
      "cookTime",
      "servings",
      "difficulty",
      "ingredients",
      "instructions",
      "tips",
      "customNotes",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        (customRecipe as any)[field] = req.body[field];
      }
    });

    await customRecipe.save();

    res.json({
      success: true,
      recipe: customRecipe,
    });
  } catch (error) {
    console.error("Error updating custom recipe:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update custom recipe",
    });
  }
});

/**
 * GET /api/custom-recipes
 * Get user's custom recipes
 */
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const customRecipes = await CustomRecipe.find({ userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      recipes: customRecipes,
    });
  } catch (error) {
    console.error("Error fetching custom recipes:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch custom recipes",
    });
  }
});

/**
 * DELETE /api/custom-recipes/:id
 * Delete a custom recipe
 */
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const customRecipe = await CustomRecipe.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!customRecipe) {
      return res.status(404).json({
        success: false,
        error: "Custom recipe not found or access denied",
      });
    }

    res.json({
      success: true,
      message: "Custom recipe deleted",
    });
  } catch (error) {
    console.error("Error deleting custom recipe:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete custom recipe",
    });
  }
});

export default router;


import { Router, Request, Response } from "express";
import { AIService } from "../services/ai-service";
import { GenerateRecipeRequest, Recipe as RecipeType } from "../types";
import { Recipe } from "../models/Recipe";
import { PDFService } from "../services/pdf-service";

const router: Router = Router();

// Initialize AI service (will be set in index.ts)
let aiService: AIService | null = null;

export function setAIService(service: AIService) {
  aiService = service;
}

/**
 * POST /api/recipes/generate
 * Generates a recipe using AI and saves it to database
 */
router.post("/generate", async (req: Request, res: Response) => {
  try {
    if (!aiService) {
      return res.status(503).json({
        success: false,
        error: "AI service is not available. Please check server configuration.",
      });
    }

    const { cuisines, ingredients, forceRegenerate }: GenerateRecipeRequest & { forceRegenerate?: boolean } = req.body;

    // Validate request
    if (!cuisines || !Array.isArray(cuisines) || cuisines.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one cuisine must be selected",
      });
    }

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one ingredient must be selected",
      });
    }

    // Check if recipe already exists in database (skip if forceRegenerate is true)
    if (!forceRegenerate) {
      // Sort arrays for consistent comparison (order doesn't matter)
      const sortedCuisines = [...cuisines].sort();
      const sortedIngredients = [...ingredients].sort();
      
      // Find existing recipe with exact same cuisines and ingredients
      // Using $all ensures all elements are present, $size ensures exact count
      const existingRecipe = await Recipe.findOne({
        $expr: {
          $and: [
            { $eq: [{ $size: "$cuisines" }, cuisines.length] },
            { $eq: [{ $size: "$ingredientIds" }, ingredients.length] },
            { $setIsSubset: [cuisines, "$cuisines"] },
            { $setIsSubset: [ingredients, "$ingredientIds"] },
          ],
        },
      });

      if (existingRecipe) {
        return res.json({
          success: true,
          recipe: existingRecipe,
          cached: true,
        });
      }
    }

    // Get model from query or use default
    const model = (req.query.model as string) || "gpt-4o-mini";

    // If forceRegenerate, get existing recipe names to avoid similarity
    let avoidSimilarTo: string[] = [];
    if (forceRegenerate) {
      const existingRecipes = await Recipe.find({
        $expr: {
          $and: [
            { $eq: [{ $size: "$cuisines" }, cuisines.length] },
            { $eq: [{ $size: "$ingredientIds" }, ingredients.length] },
            { $setIsSubset: [cuisines, "$cuisines"] },
            { $setIsSubset: [ingredients, "$ingredientIds"] },
          ],
        },
      }).select("name");

      avoidSimilarTo = existingRecipes.map((r) => r.name);
    }

    // Generate recipe with uniqueness constraint if regenerating
    const recipe = await aiService.generateRecipe(
      cuisines,
      ingredients,
      model,
      avoidSimilarTo.length > 0 ? avoidSimilarTo : undefined
    );

    // Save recipe to database
    const savedRecipe = await Recipe.create({
      ...recipe,
      cuisines,
      ingredientIds: ingredients,
      generatedBy: "ai",
      aiModel: model,
    });

    res.json({
      success: true,
      recipe: savedRecipe,
      cached: false,
    });
  } catch (error) {
    console.error("Error generating recipe:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate recipe. Please try again.",
    });
  }
});

/**
 * GET /api/recipes
 * Get all recipes from database (with pagination)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const recipes = await Recipe.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Recipe.countDocuments();

    res.json({
      success: true,
      data: recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recipes",
    });
  }
});

/**
 * GET /api/recipes/search
 * Search recipes by ingredients and/or cuisines
 * Query params: ingredients (comma-separated), cuisines (comma-separated)
 */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const ingredients = req.query.ingredients
      ? (req.query.ingredients as string).split(",").filter(Boolean)
      : [];
    const cuisines = req.query.cuisines
      ? (req.query.cuisines as string).split(",").filter(Boolean)
      : [];

    if (ingredients.length === 0 && cuisines.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one ingredient or cuisine must be provided",
      });
    }

    const query: any = {};

    // Match recipes that contain all specified ingredients
    if (ingredients.length > 0) {
      query.ingredientIds = { $all: ingredients };
    }

    // Match recipes that contain all specified cuisines
    if (cuisines.length > 0) {
      query.cuisines = { $all: cuisines };
    }

    const recipes = await Recipe.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: recipes,
      count: recipes.length,
    });
  } catch (error) {
    console.error("Error searching recipes:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search recipes",
    });
  }
});

/**
 * GET /api/recipes/:id/print
 * Generate PDF for a specific recipe and return as base64
 */
router.get("/:id/print", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: `Recipe with ID '${id}' not found`,
      });
    }

    // Convert MongoDB document to Recipe type
    const recipeData: RecipeType = {
      name: recipe.name,
      description: recipe.description,
      cuisine: recipe.cuisine,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      tips: recipe.tips,
    };

    // Generate PDF
    const pdfBuffer = await PDFService.generateRecipePDF(recipeData);

    // Convert buffer to base64
    const base64PDF = pdfBuffer.toString("base64");

    // Return JSON response with base64 PDF and metadata
    res.json({
      success: true,
      data: {
        pdf: base64PDF,
        filename: `${recipe.name.replace(/[^a-z0-9]/gi, "_")}_recipe.pdf`,
        mimeType: "application/pdf",
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate PDF",
    });
  }
});

/**
 * GET /api/recipes/:id
 * Get a specific recipe by ID
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: `Recipe with ID '${id}' not found`,
      });
    }

    res.json({ success: true, data: recipe });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recipe",
    });
  }
});

export default router;


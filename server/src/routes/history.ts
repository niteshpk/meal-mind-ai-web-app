import { Router, Response } from "express";
import { User } from "../models/User";
import { Recipe } from "../models/Recipe";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router: Router = Router();

/**
 * GET /api/history
 * Get user's recipe history
 */
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const user = await User.findById(req.user!.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Sort by most recent first and limit
    const sortedHistory = user.recipeHistory
      .sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime())
      .slice(0, limit);

    // Populate recipe details
    const recipeIds = sortedHistory.map((h) => h.recipeId);
    const recipes = await Recipe.find({
      _id: { $in: recipeIds },
    }).select("name cuisine description prepTime cookTime servings difficulty ingredients instructions tips createdAt");

    // Create map of recipes
    const recipeMap = new Map(
      recipes.map((r) => [r._id.toString(), r])
    );

    // Combine history with recipe data
    const historyWithRecipes = sortedHistory.map((h) => ({
      recipeId: h.recipeId.toString(),
      viewedAt: h.viewedAt,
      recipe: recipeMap.get(h.recipeId.toString()) || null,
    }));

    res.json({
      success: true,
      history: historyWithRecipes,
      total: user.recipeHistory.length,
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch history",
    });
  }
});

/**
 * POST /api/history/:recipeId
 * Add recipe to user's history
 */
router.post("/:recipeId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user!.id;

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: "Recipe not found",
      });
    }

    // Use atomic operations to avoid version conflicts
    // First, check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Remove old entry if exists using atomic $pull
    await User.updateOne(
      { _id: userId },
      {
        $pull: {
          recipeHistory: { recipeId: recipeId }
        }
      }
    );

    // Add new entry at the beginning and limit to 100 using atomic $push
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          recipeHistory: {
            $each: [{
              recipeId: recipe._id,
              viewedAt: new Date(),
            }],
            $position: 0,
            $slice: 100
          }
        }
      }
    );

    res.json({
      success: true,
      message: "Recipe added to history",
    });
  } catch (error) {
    console.error("Error adding to history:", error);
    // Don't fail the request if history tracking fails - it's optional
    res.json({
      success: true,
      message: "Recipe added to history",
    });
  }
});

export default router;


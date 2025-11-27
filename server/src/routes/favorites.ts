import { Router, Response } from "express";
import { Recipe } from "../models/Recipe";
import { User } from "../models/User";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router: Router = Router();

/**
 * GET /api/favorites
 * Get user's favorite recipes
 */
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).populate({
      path: "favorites",
      select: "name cuisine description prepTime cookTime servings difficulty ingredients instructions tips createdAt",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch favorites",
    });
  }
});

/**
 * POST /api/favorites/:recipeId
 * Add recipe to favorites
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

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if already favorited
    if (user.favorites.includes(recipe._id)) {
      return res.json({
        success: true,
        message: "Recipe already in favorites",
        isFavorite: true,
      });
    }

    // Add to favorites
    user.favorites.push(recipe._id);
    await user.save();

    res.json({
      success: true,
      message: "Recipe added to favorites",
      isFavorite: true,
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add favorite",
    });
  }
});

/**
 * DELETE /api/favorites/:recipeId
 * Remove recipe from favorites
 */
router.delete("/:recipeId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user!.id;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Remove from favorites
    user.favorites = user.favorites.filter(
      (favId) => favId.toString() !== recipeId
    );
    await user.save();

    res.json({
      success: true,
      message: "Recipe removed from favorites",
      isFavorite: false,
    });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove favorite",
    });
  }
});

/**
 * GET /api/favorites/check/:recipeId
 * Check if recipe is favorited
 */
router.get("/check/:recipeId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user!.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const isFavorite = user.favorites.some(
      (favId) => favId.toString() === recipeId
    );

    res.json({
      success: true,
      isFavorite,
    });
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check favorite",
    });
  }
});

export default router;


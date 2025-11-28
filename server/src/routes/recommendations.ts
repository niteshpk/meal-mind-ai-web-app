import { Router, Response } from "express";
import { RecommendationsService } from "../services/recommendations-service";
import { authenticateToken, optionalAuth, AuthRequest } from "../middleware/auth";

const router: Router = Router();

/**
 * GET /api/recommendations/similar/:recipeId
 * Get similar recipes
 */
router.get("/similar/:recipeId", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { recipeId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const recommendations = await RecommendationsService.getSimilarRecipes(
      recipeId,
      limit
    );

    res.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error("Error fetching similar recipes:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recommendations",
    });
  }
});

/**
 * GET /api/recommendations/trending
 * Get trending recipes
 */
router.get("/trending", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const recipes = await RecommendationsService.getTrendingRecipes(limit);

    res.json({
      success: true,
      recipes,
    });
  } catch (error) {
    console.error("Error fetching trending recipes:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch trending recipes",
    });
  }
});

/**
 * GET /api/recommendations/popular
 * Get popular recipes
 */
router.get("/popular", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const recipes = await RecommendationsService.getPopularRecipes(limit);

    res.json({
      success: true,
      recipes,
    });
  } catch (error) {
    console.error("Error fetching popular recipes:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch popular recipes",
    });
  }
});

/**
 * GET /api/recommendations/for-me
 * Get personalized recommendations based on user history
 */
router.get("/for-me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const recommendations = await RecommendationsService.getRecommendationsForUser(
      req.user!.id,
      limit
    );

    res.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error("Error fetching personalized recommendations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recommendations",
    });
  }
});

export default router;


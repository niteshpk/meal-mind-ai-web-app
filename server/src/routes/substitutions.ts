import { Router, Response } from "express";
import { Recipe } from "../models/Recipe";
import { SubstitutionService } from "../services/substitution-service";
import { optionalAuth, AuthRequest } from "../middleware/auth";
import { User } from "../models/User";

const router: Router = Router();

/**
 * GET /api/substitutions/ingredient/:ingredientName
 * Get substitution suggestions for an ingredient
 */
router.get("/ingredient/:ingredientName", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { ingredientName } = req.params;
    let dietaryRestrictions: string[] = [];

    // Get user's dietary restrictions if authenticated
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user?.preferences?.defaultDietaryRestrictions) {
        dietaryRestrictions = user.preferences.defaultDietaryRestrictions;
      }
    }

    // Also check query params for dietary restrictions
    if (req.query.dietary) {
      const queryDietary = Array.isArray(req.query.dietary)
        ? req.query.dietary
        : [req.query.dietary];
      dietaryRestrictions = [
        ...dietaryRestrictions,
        ...(queryDietary as string[]),
      ];
    }

    const substitutions = SubstitutionService.getSubstitutions(
      ingredientName,
      dietaryRestrictions
    );

    res.json({
      success: true,
      ingredient: ingredientName,
      substitutions,
    });
  } catch (error) {
    console.error("Error fetching substitutions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch substitutions",
    });
  }
});

/**
 * GET /api/substitutions/recipe/:recipeId
 * Get substitution suggestions for all ingredients in a recipe
 */
router.get("/recipe/:recipeId", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { recipeId } = req.params;
    let dietaryRestrictions: string[] = [];

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: "Recipe not found",
      });
    }

    // Get user's dietary restrictions if authenticated
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user?.preferences?.defaultDietaryRestrictions) {
        dietaryRestrictions = user.preferences.defaultDietaryRestrictions;
      }
    }

    // Also check query params
    if (req.query.dietary) {
      const queryDietary = Array.isArray(req.query.dietary)
        ? req.query.dietary
        : [req.query.dietary];
      dietaryRestrictions = [
        ...dietaryRestrictions,
        ...(queryDietary as string[]),
      ];
    }

    const substitutions = SubstitutionService.getRecipeSubstitutions(
      recipe as any,
      dietaryRestrictions
    );

    res.json({
      success: true,
      recipeId,
      substitutions,
    });
  } catch (error) {
    console.error("Error fetching recipe substitutions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch substitutions",
    });
  }
});

export default router;


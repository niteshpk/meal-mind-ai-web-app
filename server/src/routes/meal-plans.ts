import { Router, Response } from "express";
import { MealPlan } from "../models/MealPlan";
import { Recipe } from "../models/Recipe";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router: Router = Router();

/**
 * POST /api/meal-plans
 * Create or update a meal plan for a week
 */
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { weekStartDate, meals } = req.body;

    if (!weekStartDate || !meals || !Array.isArray(meals)) {
      return res.status(400).json({
        success: false,
        error: "weekStartDate and meals array are required",
      });
    }

    // Validate meal structure
    for (const meal of meals) {
      if (!meal.day || !meal.mealType || !meal.recipeId) {
        return res.status(400).json({
          success: false,
          error: "Each meal must have day, mealType, and recipeId",
        });
      }

      // Verify recipe exists
      const recipe = await Recipe.findById(meal.recipeId);
      if (!recipe) {
        return res.status(404).json({
          success: false,
          error: `Recipe ${meal.recipeId} not found`,
        });
      }

      meal.recipeName = recipe.name;
    }

    // Upsert meal plan
    const mealPlan = await MealPlan.findOneAndUpdate(
      {
        userId,
        weekStartDate: new Date(weekStartDate),
      },
      {
        userId,
        weekStartDate: new Date(weekStartDate),
        meals,
      },
      { upsert: true, new: true }
    ).populate("meals.recipeId", "name cuisine description prepTime cookTime servings");

    res.json({
      success: true,
      mealPlan,
    });
  } catch (error) {
    console.error("Error creating meal plan:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create meal plan",
    });
  }
});

/**
 * GET /api/meal-plans
 * Get user's meal plans
 */
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;

    const mealPlans = await MealPlan.find({ userId })
      .populate("meals.recipeId", "name cuisine description prepTime cookTime servings ingredients")
      .sort({ weekStartDate: -1 })
      .limit(limit);

    res.json({
      success: true,
      mealPlans,
    });
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch meal plans",
    });
  }
});

/**
 * GET /api/meal-plans/:weekStartDate
 * Get specific meal plan for a week
 */
router.get("/:weekStartDate", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { weekStartDate } = req.params;

    const mealPlan = await MealPlan.findOne({
      userId,
      weekStartDate: new Date(weekStartDate),
    }).populate("meals.recipeId", "name cuisine description prepTime cookTime servings ingredients instructions");

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        error: "Meal plan not found",
      });
    }

    res.json({
      success: true,
      mealPlan,
    });
  } catch (error) {
    console.error("Error fetching meal plan:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch meal plan",
    });
  }
});

/**
 * GET /api/meal-plans/:weekStartDate/shopping-list
 * Generate combined shopping list from meal plan
 */
router.get("/:weekStartDate/shopping-list", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { weekStartDate } = req.params;

    const mealPlan = await MealPlan.findOne({
      userId,
      weekStartDate: new Date(weekStartDate),
    }).populate("meals.recipeId", "name ingredients");

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        error: "Meal plan not found",
      });
    }

    if (!mealPlan.meals || mealPlan.meals.length === 0) {
      return res.json({
        success: true,
        shoppingList: [],
        recipes: [],
      });
    }

    // Collect all unique recipe IDs (handle both populated and non-populated cases)
    const recipeIds = mealPlan.meals
      .map((m) => {
        if (!m.recipeId) return null;
        // Handle both ObjectId and populated object
        return typeof m.recipeId === "object" && m.recipeId._id
          ? m.recipeId._id.toString()
          : m.recipeId.toString();
      })
      .filter(Boolean) as string[];

    const uniqueRecipeIds = [...new Set(recipeIds)];

    if (uniqueRecipeIds.length === 0) {
      return res.json({
        success: true,
        shoppingList: [],
        recipes: [],
      });
    }

    // Fetch all recipes with ingredients
    const recipes = await Recipe.find({
      _id: { $in: uniqueRecipeIds },
    }).select("name ingredients");

    // Combine ingredients from all recipes
    const ingredientMap = new Map<string, { amount: string; item: string; recipes: string[] }>();

    recipes.forEach((recipe) => {
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach((ing) => {
          const key = ing.item.toLowerCase().trim();
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            // Combine amounts if same ingredient
            existing.recipes.push(recipe.name);
            // Note: Amount combination would require parsing (e.g., "1 cup" + "2 cups" = "3 cups")
            // For now, we'll keep separate entries or combine amounts as strings
            if (existing.amount !== ing.amount) {
              existing.amount = `${existing.amount} + ${ing.amount}`;
            }
          } else {
            ingredientMap.set(key, {
              amount: ing.amount,
              item: ing.item,
              recipes: [recipe.name],
            });
          }
        });
      }
    });

    // Convert to array format
    const shoppingList = Array.from(ingredientMap.values()).map((ing, index) => ({
      id: `item-${index}`,
      name: ing.item,
      amount: ing.amount,
      recipes: ing.recipes,
    }));

    res.json({
      success: true,
      shoppingList,
      recipes: recipes.map((r) => ({ id: r._id.toString(), name: r.name })),
      weekStartDate: mealPlan.weekStartDate,
    });
  } catch (error) {
    console.error("Error generating shopping list:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate shopping list",
    });
  }
});

/**
 * DELETE /api/meal-plans/:weekStartDate
 * Delete a meal plan
 */
router.delete("/:weekStartDate", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { weekStartDate } = req.params;

    const mealPlan = await MealPlan.findOneAndDelete({
      userId,
      weekStartDate: new Date(weekStartDate),
    });

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        error: "Meal plan not found",
      });
    }

    res.json({
      success: true,
      message: "Meal plan deleted",
    });
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete meal plan",
    });
  }
});

export default router;


import { Router, Response } from "express";
import { PDFService } from "../services/pdf-service";
import { authenticateToken, optionalAuth, AuthRequest } from "../middleware/auth";
import { Recipe } from "../models/Recipe";
import { MealPlan } from "../models/MealPlan";

const router: Router = Router();

/**
 * POST /api/pdf/shopping-list
 * Generate PDF for a shopping list
 */
router.post("/shopping-list", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { items, title } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: "Items array is required",
      });
    }

    const pdfBuffer = await PDFService.generateShoppingListPDF(
      items,
      title || "Shopping List"
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${(title || "shopping-list").replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating shopping list PDF:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate PDF",
    });
  }
});

/**
 * GET /api/pdf/recipe/:id
 * Generate PDF for a recipe by ID
 */
router.get("/recipe/:id", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: "Recipe not found",
      });
    }

    const recipeData = {
      name: recipe.name,
      description: recipe.description,
      cuisine: recipe.cuisine,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      tips: recipe.tips || [],
    };

    const pdfBuffer = await PDFService.generateRecipePDF(recipeData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${recipe.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating recipe PDF:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate PDF",
    });
  }
});

/**
 * GET /api/pdf/meal-plan/:weekStartDate/shopping-list
 * Generate PDF for multi-recipe shopping list from meal plan
 */
router.get(
  "/meal-plan/:weekStartDate/shopping-list",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
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
        return res.status(400).json({
          success: false,
          error: "Meal plan has no meals",
        });
      }

      // Collect all unique recipe IDs
      const recipeIds = mealPlan.meals
        .map((m) => {
          if (!m.recipeId) return null;
          return typeof m.recipeId === "object" && m.recipeId._id
            ? m.recipeId._id.toString()
            : m.recipeId.toString();
        })
        .filter(Boolean) as string[];

      const uniqueRecipeIds = [...new Set(recipeIds)];

      // Fetch all recipes with ingredients
      const recipes = await Recipe.find({
        _id: { $in: uniqueRecipeIds },
      }).select("name ingredients");

      // Combine ingredients from all recipes
      const ingredientMap = new Map<
        string,
        { amount: string; item: string; recipes: string[] }
      >();

      recipes.forEach((recipe) => {
        if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
          recipe.ingredients.forEach((ing) => {
            const key = ing.item.toLowerCase().trim();
            if (ingredientMap.has(key)) {
              const existing = ingredientMap.get(key)!;
              existing.recipes.push(recipe.name);
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

      // Convert to shopping list format
      const shoppingListItems = Array.from(ingredientMap.values()).map((ing) => ({
        name: ing.item,
        amount: ing.amount,
        category: getCategory(ing.item),
        checked: false,
      }));

      const weekStr = new Date(weekStartDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      const pdfBuffer = await PDFService.generateShoppingListPDF(
        shoppingListItems,
        `Weekly Shopping List - ${weekStr}`
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="meal-plan-shopping-list-${weekStartDate.split("T")[0]}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating meal plan shopping list PDF:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate PDF",
      });
    }
  }
);

/**
 * Helper function to categorize ingredients
 */
function getCategory(ingredientName: string): string {
  const lowerName = ingredientName.toLowerCase();
  const categoryMap: Record<string, string> = {
    // Proteins
    chicken: "Meat & Seafood",
    beef: "Meat & Seafood",
    pork: "Meat & Seafood",
    fish: "Meat & Seafood",
    salmon: "Meat & Seafood",
    shrimp: "Meat & Seafood",
    tofu: "Meat & Seafood",
    chickpeas: "Meat & Seafood",
    lentils: "Meat & Seafood",
    beans: "Meat & Seafood",
    // Produce
    tomato: "Produce",
    tomatoes: "Produce",
    onion: "Produce",
    onions: "Produce",
    garlic: "Produce",
    peppers: "Produce",
    lettuce: "Produce",
    spinach: "Produce",
    carrot: "Produce",
    carrots: "Produce",
    potato: "Produce",
    potatoes: "Produce",
    broccoli: "Produce",
    cauliflower: "Produce",
    zucchini: "Produce",
    mushroom: "Produce",
    mushrooms: "Produce",
    avocado: "Produce",
    lemon: "Produce",
    lime: "Produce",
    ginger: "Produce",
    cilantro: "Produce",
    parsley: "Produce",
    basil: "Produce",
    // Dairy
    milk: "Dairy & Eggs",
    cheese: "Dairy & Eggs",
    butter: "Dairy & Eggs",
    cream: "Dairy & Eggs",
    yogurt: "Dairy & Eggs",
    eggs: "Dairy & Eggs",
    // Pantry
    flour: "Pantry",
    rice: "Pantry",
    pasta: "Pantry",
    bread: "Pantry",
    quinoa: "Pantry",
    oats: "Pantry",
    oil: "Pantry",
    "olive oil": "Pantry",
    salt: "Pantry",
    pepper: "Pantry",
    sugar: "Pantry",
    vinegar: "Pantry",
    "soy sauce": "Pantry",
    "coconut milk": "Pantry",
    // Nuts & Seeds
    almonds: "Nuts & Seeds",
    peanuts: "Nuts & Seeds",
    walnuts: "Nuts & Seeds",
    cashews: "Nuts & Seeds",
    pecans: "Nuts & Seeds",
    sesame: "Nuts & Seeds",
    seeds: "Nuts & Seeds",
  };

  for (const [key, category] of Object.entries(categoryMap)) {
    if (lowerName.includes(key)) {
      return category;
    }
  }
  return "Other";
}

export default router;


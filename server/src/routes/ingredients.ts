import { Router, Request, Response } from "express";
import { Ingredient } from "../models/Ingredient";
import { CuisineIngredient } from "../models/CuisineIngredient";

const router: Router = Router();

/**
 * GET /api/ingredients
 * Returns all available ingredients from database
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const ingredients = await Ingredient.find().sort({ category: 1, name: 1 });
    res.json({ success: true, data: ingredients });
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch ingredients",
    });
  }
});

/**
 * GET /api/ingredients/by-cuisine/:cuisineId
 * Returns ingredients filtered by cuisine from database
 */
router.get("/by-cuisine/:cuisineId", async (req: Request, res: Response) => {
  try {
    const { cuisineId } = req.params;
    const cuisineIngredient = await CuisineIngredient.findOne({ cuisineId });

    if (!cuisineIngredient) {
      return res.json({ success: true, data: [] });
    }

    const ingredients = await Ingredient.find({
      id: { $in: cuisineIngredient.ingredientIds },
    }).sort({ category: 1, name: 1 });

    res.json({ success: true, data: ingredients });
  } catch (error) {
    console.error("Error fetching ingredients by cuisine:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch ingredients",
    });
  }
});

/**
 * GET /api/ingredients/:id
 * Returns a specific ingredient by ID from database
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ingredient = await Ingredient.findOne({ id });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        error: `Ingredient with ID '${id}' not found`,
      });
    }

    res.json({ success: true, data: ingredient });
  } catch (error) {
    console.error("Error fetching ingredient:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch ingredient",
    });
  }
});

/**
 * GET /api/ingredients/category/:category
 * Returns ingredients filtered by category from database
 */
router.get("/category/:category", async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const ingredients = await Ingredient.find({
      category: { $regex: new RegExp(`^${category}$`, "i") },
    }).sort({ name: 1 });

    res.json({ success: true, data: ingredients });
  } catch (error) {
    console.error("Error fetching ingredients by category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch ingredients",
    });
  }
});

export default router;


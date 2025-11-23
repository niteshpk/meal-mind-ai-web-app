import { Router, Request, Response } from "express";
import { allIngredients, cuisineIngredients } from "../constants/ingredients";

const router: Router = Router();

/**
 * GET /api/ingredients
 * Returns all available ingredients
 */
router.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, data: allIngredients });
});

/**
 * GET /api/ingredients/by-cuisine/:cuisineId
 * Returns ingredients filtered by cuisine
 */
router.get("/by-cuisine/:cuisineId", (req: Request, res: Response) => {
  const { cuisineId } = req.params;
  const ingredientIds = cuisineIngredients[cuisineId] || [];
  const filteredIngredients = allIngredients.filter((ing) =>
    ingredientIds.includes(ing.id)
  );
  res.json({ success: true, data: filteredIngredients });
});

/**
 * GET /api/ingredients/:id
 * Returns a specific ingredient by ID
 */
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const ingredient = allIngredients.find((ing) => ing.id === id);

  if (!ingredient) {
    return res.status(404).json({
      success: false,
      error: `Ingredient with ID '${id}' not found`,
    });
  }

  res.json({ success: true, data: ingredient });
});

/**
 * GET /api/ingredients/category/:category
 * Returns ingredients filtered by category
 */
router.get("/category/:category", (req: Request, res: Response) => {
  const { category } = req.params;
  const filteredIngredients = allIngredients.filter(
    (ing) => ing.category.toLowerCase() === category.toLowerCase()
  );
  res.json({ success: true, data: filteredIngredients });
});

export default router;


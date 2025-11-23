import { Router, Request, Response } from "express";
import {
  recipeTemplates,
  ingredientMap,
  defaultInstructions,
  defaultTips,
  cuisineNames,
} from "../constants/recipe-templates";

const router: Router = Router();

/**
 * GET /api/recipe-templates
 * Returns all recipe templates and related data
 */
router.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      templates: recipeTemplates,
      ingredientMap,
      defaultInstructions,
      defaultTips,
      cuisineNames,
    },
  });
});

/**
 * GET /api/recipe-templates/:cuisineId
 * Returns recipe template for a specific cuisine
 */
router.get("/:cuisineId", (req: Request, res: Response) => {
  const { cuisineId } = req.params;
  const template = recipeTemplates[cuisineId];

  if (!template) {
    return res.status(404).json({
      success: false,
      error: `Recipe template for cuisine '${cuisineId}' not found`,
    });
  }

  res.json({
    success: true,
    data: {
      template,
      ingredientMap,
      defaultInstructions,
      defaultTips,
    },
  });
});

/**
 * GET /api/recipe-templates/ingredient-map
 * Returns the ingredient amount mapping
 */
router.get("/ingredient-map", (_req: Request, res: Response) => {
  res.json({ success: true, data: ingredientMap });
});

/**
 * GET /api/recipe-templates/default-instructions
 * Returns default cooking instructions
 */
router.get("/default-instructions", (_req: Request, res: Response) => {
  res.json({ success: true, data: defaultInstructions });
});

/**
 * GET /api/recipe-templates/default-tips
 * Returns default cooking tips
 */
router.get("/default-tips", (_req: Request, res: Response) => {
  res.json({ success: true, data: defaultTips });
});

/**
 * GET /api/recipe-templates/cuisine-names
 * Returns cuisine name mapping
 */
router.get("/cuisine-names", (_req: Request, res: Response) => {
  res.json({ success: true, data: cuisineNames });
});

export default router;


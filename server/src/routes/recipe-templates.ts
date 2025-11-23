import { Router, Request, Response } from "express";
import { RecipeTemplate } from "../models/RecipeTemplate";
import { IngredientMap } from "../models/IngredientMap";
import { DefaultInstructions, DefaultTips, CuisineNames } from "../models/DefaultData";

const router: Router = Router();

/**
 * GET /api/recipe-templates
 * Returns all recipe templates and related data from database
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const templates = await RecipeTemplate.find();
    const ingredientMaps = await IngredientMap.find();
    const defaultInstructionsDoc = await DefaultInstructions.findOne();
    const defaultTipsDoc = await DefaultTips.findOne();
    const cuisineNamesDocs = await CuisineNames.find();

    // Convert to expected format
    const templatesObj: Record<string, any> = {};
    templates.forEach((t) => {
      templatesObj[t.cuisineId] = {
        name: t.name,
        description: t.description,
        prepTime: t.prepTime,
        cookTime: t.cookTime,
        servings: t.servings,
        difficulty: t.difficulty,
      };
    });

    const ingredientMapObj: Record<string, string> = {};
    ingredientMaps.forEach((im) => {
      ingredientMapObj[im.ingredientId] = im.defaultAmount;
    });

    const cuisineNamesObj: Record<string, string> = {};
    cuisineNamesDocs.forEach((cn) => {
      cuisineNamesObj[cn.cuisineId] = cn.name;
    });

    res.json({
      success: true,
      data: {
        templates: templatesObj,
        ingredientMap: ingredientMapObj,
        defaultInstructions: defaultInstructionsDoc?.instructions || [],
        defaultTips: defaultTipsDoc?.tips || [],
        cuisineNames: cuisineNamesObj,
      },
    });
  } catch (error) {
    console.error("Error fetching recipe templates:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recipe templates",
    });
  }
});

/**
 * GET /api/recipe-templates/:cuisineId
 * Returns recipe template for a specific cuisine from database
 */
router.get("/:cuisineId", async (req: Request, res: Response) => {
  try {
    const { cuisineId } = req.params;
    const template = await RecipeTemplate.findOne({ cuisineId });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: `Recipe template for cuisine '${cuisineId}' not found`,
      });
    }

    const ingredientMaps = await IngredientMap.find();
    const defaultInstructionsDoc = await DefaultInstructions.findOne();
    const defaultTipsDoc = await DefaultTips.findOne();

    const ingredientMapObj: Record<string, string> = {};
    ingredientMaps.forEach((im) => {
      ingredientMapObj[im.ingredientId] = im.defaultAmount;
    });

    res.json({
      success: true,
      data: {
        template: {
          name: template.name,
          description: template.description,
          prepTime: template.prepTime,
          cookTime: template.cookTime,
          servings: template.servings,
          difficulty: template.difficulty,
        },
        ingredientMap: ingredientMapObj,
        defaultInstructions: defaultInstructionsDoc?.instructions || [],
        defaultTips: defaultTipsDoc?.tips || [],
      },
    });
  } catch (error) {
    console.error("Error fetching recipe template:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recipe template",
    });
  }
});

/**
 * GET /api/recipe-templates/ingredient-map
 * Returns the ingredient amount mapping from database
 */
router.get("/ingredient-map", async (_req: Request, res: Response) => {
  try {
    const ingredientMaps = await IngredientMap.find();
    const ingredientMapObj: Record<string, string> = {};
    ingredientMaps.forEach((im) => {
      ingredientMapObj[im.ingredientId] = im.defaultAmount;
    });
    res.json({ success: true, data: ingredientMapObj });
  } catch (error) {
    console.error("Error fetching ingredient map:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch ingredient map",
    });
  }
});

/**
 * GET /api/recipe-templates/default-instructions
 * Returns default cooking instructions from database
 */
router.get("/default-instructions", async (_req: Request, res: Response) => {
  try {
    const defaultInstructionsDoc = await DefaultInstructions.findOne();
    res.json({
      success: true,
      data: defaultInstructionsDoc?.instructions || [],
    });
  } catch (error) {
    console.error("Error fetching default instructions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch default instructions",
    });
  }
});

/**
 * GET /api/recipe-templates/default-tips
 * Returns default cooking tips from database
 */
router.get("/default-tips", async (_req: Request, res: Response) => {
  try {
    const defaultTipsDoc = await DefaultTips.findOne();
    res.json({ success: true, data: defaultTipsDoc?.tips || [] });
  } catch (error) {
    console.error("Error fetching default tips:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch default tips",
    });
  }
});

/**
 * GET /api/recipe-templates/cuisine-names
 * Returns cuisine name mapping from database
 */
router.get("/cuisine-names", async (_req: Request, res: Response) => {
  try {
    const cuisineNamesDocs = await CuisineNames.find();
    const cuisineNamesObj: Record<string, string> = {};
    cuisineNamesDocs.forEach((cn) => {
      cuisineNamesObj[cn.cuisineId] = cn.name;
    });
    res.json({ success: true, data: cuisineNamesObj });
  } catch (error) {
    console.error("Error fetching cuisine names:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch cuisine names",
    });
  }
});

export default router;


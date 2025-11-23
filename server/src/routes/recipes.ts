import { Router, Request, Response } from "express";
import { AIService } from "../services/ai-service";
import { GenerateRecipeRequest } from "../types";

const router: Router = Router();

// Initialize AI service (will be set in index.ts)
let aiService: AIService | null = null;

export function setAIService(service: AIService) {
  aiService = service;
}

/**
 * POST /api/recipes/generate
 * Generates a recipe using AI
 */
router.post("/generate", async (req: Request, res: Response) => {
  try {
    if (!aiService) {
      return res.status(503).json({
        success: false,
        error: "AI service is not available. Please check server configuration.",
      });
    }

    const { cuisines, ingredients }: GenerateRecipeRequest = req.body;

    // Validate request
    if (!cuisines || !Array.isArray(cuisines) || cuisines.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one cuisine must be selected",
      });
    }

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one ingredient must be selected",
      });
    }

    // Get model from query or use default
    const model = (req.query.model as string) || "gpt-4o-mini";

    // Generate recipe
    const recipe = await aiService.generateRecipe(cuisines, ingredients, model);

    res.json({
      success: true,
      recipe,
    });
  } catch (error) {
    console.error("Error generating recipe:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate recipe. Please try again.",
    });
  }
});

export default router;


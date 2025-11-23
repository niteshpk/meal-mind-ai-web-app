import { Recipe } from "@/types";
import { RecipeGenerationError } from "@/types/errors";
import { config } from "@/config";
import { APIService } from "./api-service";

/**
 * Recipe Service - Main interface for recipe generation
 *
 * Calls the backend API for AI-powered recipe generation.
 * Falls back to template-based generation if API is unavailable.
 */
export class RecipeService {
  /**
   * Generates a recipe based on selected cuisines and ingredients
   * Calls backend API for AI generation, with fallback to templates if needed
   *
   * @param cuisines - Array of selected cuisine IDs
   * @param ingredients - Array of selected ingredient IDs
   * @param useAI - Whether to use AI generation (default: true)
   * @returns Promise resolving to a Recipe object
   * @throws RecipeGenerationError if generation fails
   */
  static async generateRecipe(
    cuisines: string[],
    ingredients: string[],
    useAI: boolean = true
  ): Promise<Recipe> {
    try {
      if (cuisines.length === 0) {
        throw new RecipeGenerationError(
          "At least one cuisine must be selected"
        );
      }

      if (ingredients.length === 0) {
        throw new RecipeGenerationError(
          "At least one ingredient must be selected"
        );
      }

      // Try API generation first if enabled
      if (useAI) {
        try {
          const response = await fetch(
            `${config.api.url}/api/recipes/generate`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ cuisines, ingredients }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error ||
                `API request failed with status ${response.status}`
            );
          }

          const data = await response.json();
          if (data.success && data.recipe) {
            return data.recipe;
          } else {
            throw new Error(data.error || "Failed to generate recipe");
          }
        } catch (apiError) {
          // If API fails, fall back to template-based generation
          console.warn(
            "API generation failed, falling back to templates:",
            apiError
          );
        }
      }

      // Fallback to template-based generation
      return await this.generateRecipeFromTemplates(cuisines, ingredients);
    } catch (error) {
      if (error instanceof RecipeGenerationError) {
        throw error;
      }
      throw new RecipeGenerationError(
        `Failed to generate recipe: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Fallback method: Generate recipe from templates
   * This is used when AI is unavailable or disabled
   * Fetches templates from API or uses minimal hardcoded fallback
   */
  private static async generateRecipeFromTemplates(
    cuisines: string[],
    ingredients: string[]
  ): Promise<Recipe> {
    const primaryCuisine = cuisines[0];

    // Try to fetch templates from API
    try {
      const templatesData = await APIService.getRecipeTemplateByCuisine(
        primaryCuisine
      );
      if (templatesData?.template) {
        const template = templatesData.template;
        const ingredientMap = templatesData.ingredientMap || {};

        // Generate ingredient list based on selected ingredients
        const recipeIngredients = ingredients.slice(0, 8).map((id) => ({
          amount: ingredientMap[id] || "to taste",
          item: id
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
        }));

        return {
          name: template.name || "Delicious Recipe",
          description:
            template.description ||
            "A wonderful dish made with your selected ingredients.",
          cuisine:
            template.cuisine ||
            primaryCuisine.charAt(0).toUpperCase() + primaryCuisine.slice(1),
          prepTime: template.prepTime || "15",
          cookTime: template.cookTime || "20",
          servings: template.servings || 4,
          difficulty: template.difficulty || "Medium",
          ingredients: recipeIngredients,
          instructions: templatesData.defaultInstructions || [
            "Prepare all ingredients by washing, chopping, and measuring as needed.",
            "Follow the cooking instructions for your selected cuisine style.",
            "Taste and adjust seasonings as needed.",
            "Serve hot and enjoy!",
          ],
          tips: templatesData.defaultTips || [
            "Always taste as you cook and adjust seasonings to your preference.",
            "Fresh ingredients will give you the best flavor.",
          ],
        };
      }
    } catch (error) {
      console.warn(
        "Failed to fetch templates from API, using minimal fallback:",
        error
      );
    }

    // Minimal hardcoded fallback if API also fails
    const cuisineName =
      primaryCuisine.charAt(0).toUpperCase() + primaryCuisine.slice(1);
    const recipeIngredients = ingredients.slice(0, 8).map((id) => ({
      amount: "to taste",
      item: id
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    }));

    return {
      name: `${cuisineName} Recipe`,
      description: "A wonderful dish made with your selected ingredients.",
      cuisine: cuisineName,
      prepTime: "15",
      cookTime: "20",
      servings: 4,
      difficulty: "Medium",
      ingredients: recipeIngredients,
      instructions: [
        "Prepare all ingredients by washing, chopping, and measuring as needed.",
        "Follow the cooking instructions for your selected cuisine style.",
        "Taste and adjust seasonings as needed.",
        "Serve hot and enjoy!",
      ],
      tips: [
        "Always taste as you cook and adjust seasonings to your preference.",
        "Fresh ingredients will give you the best flavor.",
      ],
    };
  }
}

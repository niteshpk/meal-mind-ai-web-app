import { Recipe } from "@/types";
import { RecipeGenerationError } from "@/types/errors";
import {
  recipeTemplates,
  ingredientMap,
  cuisineNames,
  defaultInstructions,
  defaultTips,
} from "@/constants/recipe-templates";

export class RecipeService {
  /**
   * Generates a recipe based on selected cuisines and ingredients
   * @param cuisines - Array of selected cuisine IDs
   * @param ingredients - Array of selected ingredient IDs
   * @returns Promise resolving to a Recipe object
   * @throws RecipeGenerationError if generation fails
   */
  static async generateRecipe(
    cuisines: string[],
    ingredients: string[]
  ): Promise<Recipe> {
    try {
      if (cuisines.length === 0) {
        throw new RecipeGenerationError("At least one cuisine must be selected");
      }

      if (ingredients.length === 0) {
        throw new RecipeGenerationError(
          "At least one ingredient must be selected"
        );
      }

      const primaryCuisine = cuisines[0];
      const cuisineName = cuisineNames[primaryCuisine] || "Fusion";

      const template =
        recipeTemplates[primaryCuisine] || recipeTemplates.italian;

      // Generate ingredient list based on selected ingredients
      const recipeIngredients = ingredients.slice(0, 8).map((id) => ({
        amount: ingredientMap[id] || "to taste",
        item: id
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
      }));

      return {
        ...template,
        name: template.name || "Delicious Recipe",
        description:
          template.description ||
          "A wonderful dish made with your selected ingredients.",
        cuisine: cuisineName,
        prepTime: template.prepTime || "15",
        cookTime: template.cookTime || "20",
        servings: template.servings || 4,
        difficulty: template.difficulty || "Medium",
        ingredients: recipeIngredients,
        instructions: defaultInstructions,
        tips: defaultTips,
      };
    } catch (error) {
      if (error instanceof RecipeGenerationError) {
        throw error;
      }
      throw new RecipeGenerationError(
        `Failed to generate recipe: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}


import { config } from "@/config";
import { AuthService } from "./auth-service";

export class SubstitutionService {
  /**
   * Get substitutions for an ingredient
   */
  static async getIngredientSubstitutions(
    ingredientName: string,
    dietaryRestrictions: string[] = []
  ): Promise<string[]> {
    const params = new URLSearchParams();
    if (dietaryRestrictions.length > 0) {
      dietaryRestrictions.forEach((d) => params.append("dietary", d));
    }

    const response = await fetch(
      `${config.api.url}/api/substitutions/ingredient/${encodeURIComponent(ingredientName)}?${params.toString()}`,
      {
        headers: {
          ...AuthService.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.success ? (data.substitutions || []) : [];
  }

  /**
   * Get substitutions for all ingredients in a recipe
   */
  static async getRecipeSubstitutions(
    recipeId: string,
    dietaryRestrictions: string[] = []
  ): Promise<Record<string, string[]>> {
    const params = new URLSearchParams();
    if (dietaryRestrictions.length > 0) {
      dietaryRestrictions.forEach((d) => params.append("dietary", d));
    }

    const response = await fetch(
      `${config.api.url}/api/substitutions/recipe/${recipeId}?${params.toString()}`,
      {
        headers: {
          ...AuthService.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    return data.success ? (data.substitutions || {}) : {};
  }
}


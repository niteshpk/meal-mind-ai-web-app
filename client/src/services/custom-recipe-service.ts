import { config } from "@/config";
import { AuthService } from "./auth-service";
import { Recipe } from "@/types";

export interface CustomRecipe extends Recipe {
  userId: string;
  originalRecipeId?: string;
  customNotes?: string;
}

export class CustomRecipeService {
  /**
   * Create a custom recipe
   */
  static async createCustomRecipe(
    recipe: Partial<Recipe>,
    originalRecipeId?: string,
    customNotes?: string
  ): Promise<CustomRecipe> {
    const response = await fetch(`${config.api.url}/api/custom-recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        ...recipe,
        originalRecipeId,
        customNotes,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to create custom recipe");
    }

    const data = await response.json();
    return data.success ? data.recipe : null;
  }

  /**
   * Update a custom recipe
   */
  static async updateCustomRecipe(
    recipeId: string,
    updates: Partial<Recipe & { customNotes?: string }>
  ): Promise<CustomRecipe> {
    const response = await fetch(`${config.api.url}/api/custom-recipes/${recipeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to update custom recipe");
    }

    const data = await response.json();
    return data.success ? data.recipe : null;
  }

  /**
   * Get user's custom recipes
   */
  static async getCustomRecipes(): Promise<CustomRecipe[]> {
    const response = await fetch(`${config.api.url}/api/custom-recipes`, {
      headers: {
        ...AuthService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.success ? (data.recipes || []) : [];
  }

  /**
   * Delete a custom recipe
   */
  static async deleteCustomRecipe(recipeId: string): Promise<void> {
    const response = await fetch(`${config.api.url}/api/custom-recipes/${recipeId}`, {
      method: "DELETE",
      headers: {
        ...AuthService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete custom recipe");
    }
  }
}


import { config } from "@/config";
import { AuthService } from "./auth-service";
import { Recipe } from "@/types";

export class FavoritesService {
  /**
   * Get user's favorites
   */
  static async getFavorites(): Promise<Recipe[]> {
    const response = await fetch(`${config.api.url}/api/favorites`, {
      headers: {
        ...AuthService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch favorites");
    }

    const result = await response.json();
    return result.success ? result.favorites : [];
  }

  /**
   * Add recipe to favorites
   */
  static async addFavorite(recipeId: string): Promise<boolean> {
    const response = await fetch(`${config.api.url}/api/favorites/${recipeId}`, {
      method: "POST",
      headers: {
        ...AuthService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to add favorite");
    }

    const result = await response.json();
    return result.success && result.isFavorite;
  }

  /**
   * Remove recipe from favorites
   */
  static async removeFavorite(recipeId: string): Promise<boolean> {
    const response = await fetch(`${config.api.url}/api/favorites/${recipeId}`, {
      method: "DELETE",
      headers: {
        ...AuthService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to remove favorite");
    }

    const result = await response.json();
    return result.success && !result.isFavorite;
  }

  /**
   * Check if recipe is favorited
   */
  static async checkFavorite(recipeId: string): Promise<boolean> {
    const response = await fetch(`${config.api.url}/api/favorites/check/${recipeId}`, {
      headers: {
        ...AuthService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.success ? result.isFavorite : false;
  }
}


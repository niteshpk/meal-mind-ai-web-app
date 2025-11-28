import { config } from "@/config";
import { AuthService } from "./auth-service";
import { Recipe } from "@/types";

export class RecommendationsService {
  /**
   * Get similar recipes
   */
  static async getSimilar(recipeId: string, limit = 5): Promise<Recipe[]> {
    const response = await fetch(
      `${config.api.url}/api/recommendations/similar/${recipeId}?limit=${limit}`,
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
    return data.success ? (data.recommendations || []) : [];
  }

  /**
   * Get trending recipes
   */
  static async getTrending(limit = 10): Promise<Recipe[]> {
    const response = await fetch(
      `${config.api.url}/api/recommendations/trending?limit=${limit}`,
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
    return data.success ? (data.recipes || []) : [];
  }

  /**
   * Get personalized recommendations
   */
  static async getForMe(limit = 10): Promise<Recipe[]> {
    const response = await fetch(
      `${config.api.url}/api/recommendations/for-me?limit=${limit}`,
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
    return data.success ? (data.recommendations || []) : [];
  }

  /**
   * Get popular recipes
   */
  static async getPopular(limit = 10): Promise<Recipe[]> {
    const response = await fetch(
      `${config.api.url}/api/recommendations/popular?limit=${limit}`,
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
    return data.success ? (data.recipes || []) : [];
  }
}


import { config } from "@/config";
import { AuthService } from "./auth-service";

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userName: string;
  createdAt: string;
}

export interface RatingData {
  averageRating: number;
  ratingCount: number;
  userReview: {
    rating: number;
    comment?: string;
  } | null;
  reviews: Review[];
}

export class RatingsService {
  /**
   * Get ratings and reviews for a recipe
   */
  static async getRatings(recipeId: string, page = 1, limit = 10): Promise<RatingData> {
    const response = await fetch(
      `${config.api.url}/api/ratings/${recipeId}?page=${page}&limit=${limit}`,
      {
        headers: {
          ...AuthService.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch ratings");
    }

    const data = await response.json();
    return data.success ? data : { averageRating: 0, ratingCount: 0, userReview: null, reviews: [] };
  }

  /**
   * Add or update rating
   */
  static async addRating(
    recipeId: string,
    rating: number,
    comment?: string
  ): Promise<{ success: boolean; averageRating: number; ratingCount: number }> {
    const response = await fetch(`${config.api.url}/api/ratings/${recipeId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({ rating, comment }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to add rating");
    }

    const data = await response.json();
    return data.success ? data : { success: false, averageRating: 0, ratingCount: 0 };
  }

  /**
   * Remove rating
   */
  static async removeRating(recipeId: string): Promise<void> {
    const response = await fetch(`${config.api.url}/api/ratings/${recipeId}`, {
      method: "DELETE",
      headers: {
        ...AuthService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to remove rating");
    }
  }
}


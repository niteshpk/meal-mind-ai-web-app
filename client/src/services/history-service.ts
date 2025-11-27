import { config } from "@/config";
import { AuthService } from "./auth-service";
import { Recipe } from "@/types";

export interface HistoryEntry {
  recipeId: string;
  viewedAt: string;
  recipe: Recipe | null;
}

export class HistoryService {
  /**
   * Get user's recipe history
   */
  static async getHistory(limit?: number): Promise<{
    history: HistoryEntry[];
    total: number;
  }> {
    const url = new URL(`${config.api.url}/api/history`);
    if (limit) {
      url.searchParams.set("limit", limit.toString());
    }

    const response = await fetch(url.toString(), {
      headers: {
        ...AuthService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch history");
    }

    const result = await response.json();
    return result.success
      ? { history: result.history, total: result.total }
      : { history: [], total: 0 };
  }

  /**
   * Add recipe to history
   */
  static async addToHistory(recipeId: string): Promise<void> {
    const response = await fetch(`${config.api.url}/api/history/${recipeId}`, {
      method: "POST",
      headers: {
        ...AuthService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      // Don't throw error - history tracking is optional
      console.error("Failed to add to history");
    }
  }
}


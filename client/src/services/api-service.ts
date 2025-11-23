import { config } from "@/config";
import { Cuisine, Ingredient } from "@/types";

/**
 * API Service - Handles communication with backend API
 * Provides fallback to local constants if API is unavailable
 */
export class APIService {
  /**
   * Fetch cuisines from API
   * Returns empty array if API fails (no local fallback)
   */
  static async getCuisines(): Promise<Cuisine[]> {
    try {
      const response = await fetch(`${config.api.url}/api/cuisines`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
    } catch (error) {
      console.error("Failed to fetch cuisines from API:", error);
    }

    // Return empty array if API fails - components should handle this gracefully
    console.warn(
      "No cuisines available. Please ensure the backend server is running."
    );
    return [];
  }

  /**
   * Fetch a specific cuisine by ID from API
   */
  static async getCuisineById(id: string): Promise<Cuisine | null> {
    try {
      const response = await fetch(`${config.api.url}/api/cuisines/${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch cuisine ${id} from API:`, error);
    }
    return null;
  }

  /**
   * Fetch ingredients from API
   * Returns empty array if API fails (no local fallback)
   */
  static async getIngredients(): Promise<Ingredient[]> {
    try {
      const response = await fetch(`${config.api.url}/api/ingredients`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
    } catch (error) {
      console.error("Failed to fetch ingredients from API:", error);
    }

    // Return empty array if API fails - components should handle this gracefully
    console.warn(
      "No ingredients available. Please ensure the backend server is running."
    );
    return [];
  }

  /**
   * Fetch ingredients filtered by cuisine from API
   * Returns empty array if API fails (no local fallback)
   */
  static async getIngredientsByCuisine(
    cuisineId: string
  ): Promise<Ingredient[]> {
    try {
      const response = await fetch(
        `${config.api.url}/api/ingredients/by-cuisine/${cuisineId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
    } catch (error) {
      console.error(
        `Failed to fetch ingredients for ${cuisineId} from API:`,
        error
      );
    }

    // Return empty array if API fails - components should handle this gracefully
    console.warn(
      `No ingredients available for cuisine ${cuisineId}. Please ensure the backend server is running.`
    );
    return [];
  }

  /**
   * Fetch ingredients by category from API
   */
  static async getIngredientsByCategory(
    category: string
  ): Promise<Ingredient[]> {
    try {
      const response = await fetch(
        `${config.api.url}/api/ingredients/category/${category}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
    } catch (error) {
      console.warn(
        `Failed to fetch ingredients for category ${category} from API:`,
        error
      );
    }
    return [];
  }

  /**
   * Fetch recipe templates from API
   */
  static async getRecipeTemplates(): Promise<any> {
    try {
      const response = await fetch(`${config.api.url}/api/recipe-templates`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
    } catch (error) {
      console.warn("Failed to fetch recipe templates from API:", error);
    }
    return null;
  }

  /**
   * Fetch recipe template for a specific cuisine from API
   */
  static async getRecipeTemplateByCuisine(cuisineId: string): Promise<any> {
    try {
      const response = await fetch(
        `${config.api.url}/api/recipe-templates/${cuisineId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
    } catch (error) {
      console.warn(
        `Failed to fetch recipe template for ${cuisineId} from API:`,
        error
      );
    }
    return null;
  }

  /**
   * Check if API is available
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${config.api.url}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

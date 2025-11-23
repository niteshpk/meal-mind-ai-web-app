import { Recipe } from "@/types";

/**
 * Service for storing and retrieving cached recipes
 * Currently uses localStorage for browser-based storage
 * 
 * NOTE: This service is designed to be easily replaceable with a backend API call.
 * When you implement your backend, you can modify this service to make HTTP requests
 * instead of using localStorage, without changing the interface.
 */
export class RecipeStorageService {
  private static readonly STORAGE_KEY = "mealmind_recipes_cache";

  /**
   * Generate a cache key from cuisines and ingredients
   */
  private static generateCacheKey(
    cuisines: string[],
    ingredients: string[]
  ): string {
    const sortedCuisines = [...cuisines].sort().join(",");
    const sortedIngredients = [...ingredients].sort().join(",");
    return `${sortedCuisines}::${sortedIngredients}`;
  }

  /**
   * Load all cached recipes from storage
   */
  private static loadCache(): Map<string, Recipe> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return new Map();
      }

      const cacheData = JSON.parse(stored);
      return new Map(Object.entries(cacheData));
    } catch (error) {
      console.error("Error loading recipe cache:", error);
      return new Map();
    }
  }

  /**
   * Save all cached recipes to storage
   */
  private static saveCache(cache: Map<string, Recipe>): void {
    try {
      const cacheObject = Object.fromEntries(cache);
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(cacheObject)
      );
    } catch (error) {
      console.error("Error saving recipe cache:", error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        console.warn("LocalStorage quota exceeded. Clearing old cache entries.");
        // Clear cache if storage is full
        this.clearCache();
      }
      throw error;
    }
  }

  /**
   * Export cache to downloadable JSON file
   * This allows users to save recipes for backup or transfer
   */
  static exportCache(): string {
    const cache = this.loadCache();
    const cacheObject = Object.fromEntries(cache);
    return JSON.stringify(cacheObject, null, 2);
  }

  /**
   * Import cache from JSON string
   */
  static importCache(jsonString: string): void {
    try {
      const cacheData = JSON.parse(jsonString);
      const cache = new Map(Object.entries(cacheData));
      this.saveCache(cache);
    } catch (error) {
      console.error("Error importing recipe cache:", error);
      throw new Error("Invalid cache format");
    }
  }

  /**
   * Get a cached recipe if it exists
   * @param cuisines - Array of selected cuisine IDs
   * @param ingredients - Array of selected ingredient IDs
   * @returns Cached recipe or null if not found
   */
  static getCachedRecipe(
    cuisines: string[],
    ingredients: string[]
  ): Recipe | null {
    const cache = this.loadCache();
    const key = this.generateCacheKey(cuisines, ingredients);
    return cache.get(key) || null;
  }

  /**
   * Store a recipe in cache
   * @param cuisines - Array of selected cuisine IDs
   * @param ingredients - Array of selected ingredient IDs
   * @param recipe - Recipe to cache
   */
  static cacheRecipe(
    cuisines: string[],
    ingredients: string[],
    recipe: Recipe
  ): void {
    const cache = this.loadCache();
    const key = this.generateCacheKey(cuisines, ingredients);
    cache.set(key, recipe);
    this.saveCache(cache);
  }

  /**
   * Get all cached recipes
   * @returns Array of all cached recipes
   */
  static getAllCachedRecipes(): Recipe[] {
    const cache = this.loadCache();
    return Array.from(cache.values());
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { count: number; size: number } {
    const cache = this.loadCache();
    const cacheString = JSON.stringify(Object.fromEntries(cache));
    return {
      count: cache.size,
      size: new Blob([cacheString]).size, // Size in bytes
    };
  }

  /**
   * Clear all cached recipes
   */
  static clearCache(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}


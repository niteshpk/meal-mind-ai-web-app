import { describe, it, expect } from "vitest";
import { RecipeService } from "../recipe-service";
import { RecipeGenerationError } from "@/types/errors";

describe("RecipeService", () => {
  describe("generateRecipe", () => {
    it("should generate a recipe with valid inputs", async () => {
      const cuisines = ["italian"];
      const ingredients = ["tomato", "pasta", "garlic"];

      const recipe = await RecipeService.generateRecipe(cuisines, ingredients);

      expect(recipe).toBeDefined();
      expect(recipe.name).toBe("Rustic Italian Pasta");
      expect(recipe.cuisine).toBe("Italian");
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      expect(recipe.instructions.length).toBeGreaterThan(0);
      expect(recipe.tips.length).toBeGreaterThan(0);
    });

    it("should throw error when no cuisines are selected", async () => {
      const cuisines: string[] = [];
      const ingredients = ["tomato", "pasta"];

      await expect(
        RecipeService.generateRecipe(cuisines, ingredients)
      ).rejects.toThrow(RecipeGenerationError);
    });

    it("should throw error when no ingredients are selected", async () => {
      const cuisines = ["italian"];
      const ingredients: string[] = [];

      await expect(
        RecipeService.generateRecipe(cuisines, ingredients)
      ).rejects.toThrow(RecipeGenerationError);
    });

    it("should handle unknown cuisine gracefully", async () => {
      const cuisines = ["unknown-cuisine"];
      const ingredients = ["tomato", "pasta"];

      const recipe = await RecipeService.generateRecipe(cuisines, ingredients);

      expect(recipe).toBeDefined();
      expect(recipe.cuisine).toBe("Fusion");
    });
  });
});


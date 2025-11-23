export type Screen =
  | "landing"
  | "cuisine"
  | "ingredients"
  | "loading"
  | "recipe";

export interface Recipe {
  name: string;
  description: string;
  cuisine: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  ingredients: { amount: string; item: string }[];
  instructions: string[];
  tips: string[];
}

/**
 * Flattened recipe structure optimized for TOON format
 * Used for API communication to reduce token usage
 */
export interface FlattenedRecipe {
  name: string;
  description: string;
  cuisine: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  ingredientAmounts: string[];
  ingredientItems: string[];
  instructions: string[];
  tips: string[];
}

export interface Cuisine {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
}

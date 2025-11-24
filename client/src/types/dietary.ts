export type DietaryRestriction =
  | "vegan"
  | "vegetarian"
  | "gluten-free"
  | "keto"
  | "paleo"
  | "dairy-free"
  | "nut-free"
  | "low-carb"
  | "halal"
  | "kosher";

export interface DietaryPreferences {
  restrictions: DietaryRestriction[];
}

export interface IngredientMetadata {
  id: string;
  name: string;
  category: string;
  dietaryFlags: {
    vegan: boolean;
    vegetarian: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    nutFree: boolean;
  };
}


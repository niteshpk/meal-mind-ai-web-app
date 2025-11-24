import { DietaryRestriction } from "@/types/dietary";

// Ingredient database with dietary flags
const INGREDIENT_DIETARY_MAP: Record<string, Partial<{
  vegan: boolean;
  vegetarian: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  nutFree: boolean;
}>> = {
  // Proteins
  "chicken": { vegan: false, vegetarian: false, glutenFree: true, dairyFree: true, nutFree: true },
  "beef": { vegan: false, vegetarian: false, glutenFree: true, dairyFree: true, nutFree: true },
  "pork": { vegan: false, vegetarian: false, glutenFree: true, dairyFree: true, nutFree: true },
  "fish": { vegan: false, vegetarian: false, glutenFree: true, dairyFree: true, nutFree: true },
  "tofu": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: true },
  "chickpeas": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: true },
  "lentils": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: true },
  "beans": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: true },
  
  // Dairy
  "milk": { vegan: false, vegetarian: true, glutenFree: true, dairyFree: false, nutFree: true },
  "cheese": { vegan: false, vegetarian: true, glutenFree: true, dairyFree: false, nutFree: true },
  "butter": { vegan: false, vegetarian: true, glutenFree: true, dairyFree: false, nutFree: true },
  "cream": { vegan: false, vegetarian: true, glutenFree: true, dairyFree: false, nutFree: true },
  "yogurt": { vegan: false, vegetarian: true, glutenFree: true, dairyFree: false, nutFree: true },
  "eggs": { vegan: false, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: true },
  
  // Grains
  "wheat-flour": { vegan: true, vegetarian: true, glutenFree: false, dairyFree: true, nutFree: true },
  "flour": { vegan: true, vegetarian: true, glutenFree: false, dairyFree: true, nutFree: true },
  "rice": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: true },
  "pasta": { vegan: true, vegetarian: true, glutenFree: false, dairyFree: true, nutFree: true },
  "bread": { vegan: true, vegetarian: true, glutenFree: false, dairyFree: true, nutFree: true },
  "quinoa": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: true },
  "oats": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: true },
  
  // Nuts
  "almonds": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: false },
  "peanuts": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: false },
  "walnuts": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: false },
  "cashews": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: false },
  "pecans": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: false },
  
  // Common ingredients
  "tomato": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: true },
  "onion": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: true },
  "garlic": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: true },
  "pepper": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: true },
  "salt": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: true },
  "oil": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: true },
  "olive-oil": { vegan: true, vegetarian: true, glutenFree: true, dairyFree: true, nutFree: true },
};

export function isIngredientCompatible(
  ingredientId: string,
  restrictions: DietaryRestriction[]
): boolean {
  if (restrictions.length === 0) return true;
  
  const flags = INGREDIENT_DIETARY_MAP[ingredientId];
  if (!flags) return true; // Unknown ingredients pass by default
  
  for (const restriction of restrictions) {
    switch (restriction) {
      case "vegan":
        if (flags.vegan === false) return false;
        break;
      case "vegetarian":
        if (flags.vegetarian === false) return false;
        break;
      case "gluten-free":
        if (flags.glutenFree === false) return false;
        break;
      case "dairy-free":
        if (flags.dairyFree === false) return false;
        break;
      case "nut-free":
        if (flags.nutFree === false) return false;
        break;
      case "keto":
      case "low-carb":
        // Check if ingredient is high-carb (would need carb data)
        // For now, allow all ingredients
        break;
      case "paleo":
        // Check if ingredient is paleo-compliant
        // For now, allow all ingredients
        break;
    }
  }
  
  return true;
}

export function filterIngredientsByDietary(
  ingredients: Array<{ id: string; name: string; category: string }>,
  restrictions: DietaryRestriction[]
): Array<{ id: string; name: string; category: string }> {
  return ingredients.filter((ing) =>
    isIngredientCompatible(ing.id, restrictions)
  );
}

export function getDietaryPromptAddition(restrictions: DietaryRestriction[]): string {
  if (restrictions.length === 0) return "";
  
  const restrictionsText = restrictions
    .map((r) => r.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()))
    .join(", ");
  
  return `\n\nIMPORTANT: This recipe must be ${restrictionsText}. Ensure all ingredients and cooking methods comply with these dietary restrictions.`;
}


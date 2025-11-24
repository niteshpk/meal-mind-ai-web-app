import { Recipe } from "@/types";
import { ShoppingListItem } from "@/types/shopping";

const CATEGORY_MAP: Record<string, string> = {
  // Proteins
  "chicken": "Meat & Seafood",
  "beef": "Meat & Seafood",
  "pork": "Meat & Seafood",
  "fish": "Meat & Seafood",
  "salmon": "Meat & Seafood",
  "shrimp": "Meat & Seafood",
  "tofu": "Meat & Seafood",
  "chickpeas": "Meat & Seafood",
  "lentils": "Meat & Seafood",
  "beans": "Meat & Seafood",
  
  // Produce
  "tomato": "Produce",
  "tomatoes": "Produce",
  "onion": "Produce",
  "onions": "Produce",
  "garlic": "Produce",
  "peppers": "Produce",
  "bell-pepper": "Produce",
  "lettuce": "Produce",
  "spinach": "Produce",
  "carrot": "Produce",
  "carrots": "Produce",
  "potato": "Produce",
  "potatoes": "Produce",
  "broccoli": "Produce",
  "cauliflower": "Produce",
  "zucchini": "Produce",
  "mushroom": "Produce",
  "mushrooms": "Produce",
  "avocado": "Produce",
  "lemon": "Produce",
  "lime": "Produce",
  "ginger": "Produce",
  "cilantro": "Produce",
  "parsley": "Produce",
  "basil": "Produce",
  
  // Dairy
  "milk": "Dairy & Eggs",
  "cheese": "Dairy & Eggs",
  "butter": "Dairy & Eggs",
  "cream": "Dairy & Eggs",
  "yogurt": "Dairy & Eggs",
  "eggs": "Dairy & Eggs",
  
  // Pantry
  "flour": "Pantry",
  "wheat-flour": "Pantry",
  "rice": "Pantry",
  "pasta": "Pantry",
  "bread": "Pantry",
  "quinoa": "Pantry",
  "oats": "Pantry",
  "oil": "Pantry",
  "olive-oil": "Pantry",
  "salt": "Pantry",
  "black-pepper": "Pantry",
  "sugar": "Pantry",
  "vinegar": "Pantry",
  "soy-sauce": "Pantry",
  "coconut-milk": "Pantry",
  
  // Nuts & Seeds
  "almonds": "Nuts & Seeds",
  "peanuts": "Nuts & Seeds",
  "walnuts": "Nuts & Seeds",
  "cashews": "Nuts & Seeds",
  "pecans": "Nuts & Seeds",
  "sesame": "Nuts & Seeds",
  "seeds": "Nuts & Seeds",
};

function getCategory(ingredientName: string): string {
  const lowerName = ingredientName.toLowerCase();
  for (const [key, category] of Object.entries(CATEGORY_MAP)) {
    if (lowerName.includes(key)) {
      return category;
    }
  }
  return "Other";
}

export function recipeToShoppingList(recipe: Recipe): ShoppingListItem[] {
  return recipe.ingredients.map((ing, index) => ({
    id: `item-${index}`,
    name: ing.item,
    amount: ing.amount,
    category: getCategory(ing.item),
    checked: false,
  }));
}

export function groupShoppingListByCategory(
  items: ShoppingListItem[]
): Record<string, ShoppingListItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);
}

export function exportShoppingListToText(items: ShoppingListItem[]): string {
  const grouped = groupShoppingListByCategory(items);
  let text = "Shopping List\n";
  text += "=".repeat(20) + "\n\n";
  
  for (const [category, categoryItems] of Object.entries(grouped)) {
    text += `${category}\n`;
    text += "-".repeat(category.length) + "\n";
    categoryItems.forEach((item) => {
      const checkmark = item.checked ? "✓" : "☐";
      text += `${checkmark} ${item.amount} ${item.name}\n`;
    });
    text += "\n";
  }
  
  return text;
}


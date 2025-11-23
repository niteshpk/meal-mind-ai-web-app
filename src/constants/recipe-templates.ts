import { Recipe } from "@/types";

export const cuisineNames: Record<string, string> = {
  italian: "Italian",
  mexican: "Mexican",
  chinese: "Chinese",
  japanese: "Japanese",
  indian: "Indian",
  thai: "Thai",
  mediterranean: "Mediterranean",
  french: "French",
};

// Sample recipe templates for each cuisine
export const recipeTemplates: Record<string, Partial<Recipe>> = {
  italian: {
    name: "Rustic Italian Pasta",
    description:
      "A classic Italian dish featuring fresh ingredients and bold flavors that come together in perfect harmony.",
    difficulty: "Medium",
    prepTime: "15",
    cookTime: "20",
    servings: 4,
  },
  mexican: {
    name: "Authentic Mexican Tacos",
    description:
      "Vibrant and flavorful tacos with a perfect balance of spices and fresh toppings.",
    difficulty: "Easy",
    prepTime: "20",
    cookTime: "15",
    servings: 4,
  },
  chinese: {
    name: "Savory Stir-Fry",
    description:
      "A quick and delicious stir-fry with perfectly cooked vegetables and aromatic seasonings.",
    difficulty: "Easy",
    prepTime: "15",
    cookTime: "10",
    servings: 3,
  },
  japanese: {
    name: "Japanese Rice Bowl",
    description:
      "A beautifully balanced bowl featuring fresh ingredients and umami-rich flavors.",
    difficulty: "Medium",
    prepTime: "20",
    cookTime: "15",
    servings: 2,
  },
  indian: {
    name: "Aromatic Indian Curry",
    description:
      "A rich and fragrant curry with layers of spices and creamy texture.",
    difficulty: "Medium",
    prepTime: "15",
    cookTime: "30",
    servings: 4,
  },
  thai: {
    name: "Thai Coconut Curry",
    description:
      "Sweet, spicy, and aromatic Thai curry with a creamy coconut base.",
    difficulty: "Medium",
    prepTime: "15",
    cookTime: "25",
    servings: 4,
  },
  mediterranean: {
    name: "Mediterranean Fresh Bowl",
    description:
      "A light and healthy Mediterranean dish bursting with fresh flavors.",
    difficulty: "Easy",
    prepTime: "15",
    cookTime: "10",
    servings: 3,
  },
  french: {
    name: "French Bistro Classic",
    description:
      "An elegant French dish with refined techniques and rich flavors.",
    difficulty: "Hard",
    prepTime: "20",
    cookTime: "35",
    servings: 4,
  },
};

export const ingredientMap: Record<string, string> = {
  tomato: "2 large",
  onion: "1 medium",
  garlic: "3 cloves",
  basil: "1/4 cup fresh",
  oregano: "1 tsp",
  pasta: "400g",
  "olive-oil": "3 tbsp",
  mozzarella: "200g",
  parmesan: "1/2 cup grated",
  "bell-pepper": "1 large",
  cilantro: "1/4 cup fresh",
  lime: "2",
  avocado: "1 ripe",
  jalapeno: "1",
  cumin: "1 tsp",
  "black-beans": "1 can",
  cheese: "1 cup shredded",
  "soy-sauce": "3 tbsp",
  ginger: "1 inch piece",
  rice: "2 cups",
  "sesame-oil": "2 tsp",
  "green-onion": "3 stalks",
  chicken: "500g",
  mushroom: "200g",
  "rice-vinegar": "2 tbsp",
  seaweed: "2 sheets",
  mirin: "2 tbsp",
  miso: "2 tbsp",
  tofu: "300g",
  turmeric: "1 tsp",
  coriander: "2 tsp",
  "garam-masala": "1 tsp",
  "coconut-milk": "400ml",
  "curry-leaves": "10-12",
  "fish-sauce": "2 tbsp",
  chili: "2",
  lemongrass: "2 stalks",
  feta: "150g",
  lemon: "1",
  cucumber: "1",
  olives: "1/2 cup",
  butter: "50g",
  thyme: "1 tsp",
  "white-wine": "1/2 cup",
  cream: "200ml",
  parsley: "1/4 cup fresh",
  shallot: "2",
  eggs: "2",
  beef: "500g",
  pork: "500g",
};

export const defaultInstructions = [
  "Prepare all ingredients by washing, chopping, and measuring as needed. This will make the cooking process much smoother.",
  "Heat your cooking vessel over medium heat and add your base oils or fats. Allow them to warm up properly before adding other ingredients.",
  "Add your aromatics (garlic, onion, ginger) and sauté until fragrant, about 2-3 minutes. Be careful not to burn them.",
  "Add your main protein or vegetables and cook according to their requirements. Season with salt and pepper.",
  "Incorporate your sauces, spices, and liquids. Adjust heat as needed and allow flavors to meld together.",
  "Continue cooking until everything is properly cooked through and the sauce reaches your desired consistency.",
  "Taste and adjust seasonings as needed. Remember, you can always add more but can't take away.",
  "Serve hot, garnished with fresh herbs or toppings of your choice. Enjoy your meal!",
];

export const defaultTips = [
  "Always taste as you cook and adjust seasonings to your preference.",
  "Fresh ingredients will give you the best flavor - use them when possible.",
  "Don't be afraid to make this recipe your own by adding your favorite ingredients.",
  "Leftovers can be stored in an airtight container in the refrigerator for up to 3 days.",
];


import { Recipe } from "../types";

// Common ingredient substitutions
const SUBSTITUTION_MAP: Record<string, string[]> = {
  // Dairy
  "butter": ["olive oil", "coconut oil", "margarine", "avocado"],
  "milk": ["almond milk", "soy milk", "oat milk", "coconut milk"],
  "cream": ["coconut cream", "cashew cream", "evaporated milk"],
  "cheese": ["nutritional yeast", "cashew cheese", "dairy-free cheese"],
  
  // Eggs
  "eggs": ["flax eggs (1 tbsp ground flaxseed + 3 tbsp water)", "chia eggs", "applesauce", "banana"],
  
  // Flour
  "all-purpose flour": ["whole wheat flour", "almond flour", "coconut flour", "gluten-free flour blend"],
  "wheat flour": ["rice flour", "almond flour", "coconut flour", "oat flour"],
  
  // Sweeteners
  "sugar": ["honey", "maple syrup", "agave nectar", "stevia", "coconut sugar"],
  "brown sugar": ["coconut sugar", "maple syrup", "honey"],
  
  // Oils
  "vegetable oil": ["olive oil", "coconut oil", "avocado oil", "canola oil"],
  "olive oil": ["vegetable oil", "coconut oil", "avocado oil"],
  
  // Herbs & Spices
  "fresh basil": ["dried basil", "oregano", "thyme"],
  "fresh parsley": ["dried parsley", "cilantro", "chives"],
  "fresh cilantro": ["fresh parsley", "coriander seeds"],
  
  // Proteins
  "chicken": ["tofu", "tempeh", "chickpeas", "lentils"],
  "beef": ["mushrooms", "lentils", "tempeh", "jackfruit"],
  "pork": ["chicken", "tofu", "mushrooms"],
  "fish": ["tofu", "tempeh", "chickpeas"],
  
  // Vegetables
  "onion": ["shallots", "leeks", "scallions"],
  "garlic": ["garlic powder", "shallots"],
  "tomatoes": ["canned tomatoes", "tomato paste", "sun-dried tomatoes"],
  
  // Grains
  "rice": ["quinoa", "cauliflower rice", "barley", "couscous"],
  "pasta": ["zucchini noodles", "spaghetti squash", "rice noodles", "gluten-free pasta"],
  "bread": ["gluten-free bread", "lettuce wraps", "tortillas"],
};

// Dietary-specific substitutions
const DIETARY_SUBSTITUTIONS: Record<string, Record<string, string[]>> = {
  "vegan": {
    "butter": ["coconut oil", "olive oil", "vegan margarine"],
    "milk": ["almond milk", "soy milk", "oat milk"],
    "cheese": ["nutritional yeast", "vegan cheese"],
    "eggs": ["flax eggs", "chia eggs", "applesauce"],
    "honey": ["maple syrup", "agave nectar"],
  },
  "gluten-free": {
    "flour": ["almond flour", "coconut flour", "rice flour", "gluten-free flour blend"],
    "bread": ["gluten-free bread", "rice cakes"],
    "pasta": ["rice noodles", "zucchini noodles", "gluten-free pasta"],
    "soy sauce": ["tamari", "coconut aminos"],
  },
  "keto": {
    "sugar": ["stevia", "erythritol", "monk fruit"],
    "flour": ["almond flour", "coconut flour"],
    "rice": ["cauliflower rice"],
    "pasta": ["zucchini noodles", "shirataki noodles"],
  },
  "paleo": {
    "dairy": ["coconut milk", "almond milk"],
    "grains": ["cauliflower rice", "sweet potato"],
    "legumes": ["nuts", "seeds"],
  },
};

export class SubstitutionService {
  /**
   * Get substitution suggestions for an ingredient
   */
  static getSubstitutions(
    ingredientName: string,
    dietaryRestrictions: string[] = []
  ): string[] {
    const lowerName = ingredientName.toLowerCase().trim();
    
    // Check exact matches first
    if (SUBSTITUTION_MAP[lowerName]) {
      let substitutions = [...SUBSTITUTION_MAP[lowerName]];
      
      // Apply dietary-specific substitutions
      for (const restriction of dietaryRestrictions) {
        if (DIETARY_SUBSTITUTIONS[restriction]?.[lowerName]) {
          substitutions = [
            ...DIETARY_SUBSTITUTIONS[restriction][lowerName],
            ...substitutions.filter(
              (s) => !DIETARY_SUBSTITUTIONS[restriction][lowerName].includes(s)
            ),
          ];
        }
      }
      
      return substitutions.slice(0, 5); // Return top 5
    }
    
    // Check partial matches
    for (const [key, subs] of Object.entries(SUBSTITUTION_MAP)) {
      if (lowerName.includes(key) || key.includes(lowerName)) {
        return subs.slice(0, 5);
      }
    }
    
    // Check dietary-specific partial matches
    for (const restriction of dietaryRestrictions) {
      if (DIETARY_SUBSTITUTIONS[restriction]) {
        for (const [key, subs] of Object.entries(DIETARY_SUBSTITUTIONS[restriction])) {
          if (lowerName.includes(key) || key.includes(lowerName)) {
            return subs.slice(0, 5);
          }
        }
      }
    }
    
    return [];
  }

  /**
   * Get substitutions for all ingredients in a recipe
   */
  static getRecipeSubstitutions(
    recipe: Recipe,
    dietaryRestrictions: string[] = []
  ): Record<string, string[]> {
    const substitutions: Record<string, string[]> = {};
    
    recipe.ingredients.forEach((ing) => {
      const subs = this.getSubstitutions(ing.item, dietaryRestrictions);
      if (subs.length > 0) {
        substitutions[ing.item] = subs;
      }
    });
    
    return substitutions;
  }
}


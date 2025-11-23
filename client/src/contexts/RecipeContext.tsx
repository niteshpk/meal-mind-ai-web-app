import { createContext, useContext, useState, ReactNode } from "react";
import { Screen, Recipe } from "@/types";
import { RecipeService } from "@/services/recipe-service";

interface RecipeContextType {
  currentScreen: Screen;
  selectedCuisines: string[];
  selectedIngredients: string[];
  recipe: Recipe | null;
  isCached: boolean;
  setCurrentScreen: (screen: Screen) => void;
  setRecipe: (recipe: Recipe | null) => void;
  toggleCuisine: (cuisineId: string) => void;
  toggleIngredient: (ingredientId: string) => void;
  generateRecipe: (forceRegenerate?: boolean) => Promise<void>;
  regenerateRecipe: () => Promise<void>;
  reset: () => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);

  // Handle cuisine toggle
  const toggleCuisine = (cuisineId: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisineId)
        ? prev.filter((id) => id !== cuisineId)
        : [...prev, cuisineId]
    );
  };

  // Handle ingredient toggle
  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredientId)
        ? prev.filter((id) => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  // Generate recipe
  const generateRecipe = async (forceRegenerate: boolean = false) => {
    setCurrentScreen("loading");
    const result = await RecipeService.generateRecipe(
      selectedCuisines,
      selectedIngredients,
      true,
      forceRegenerate
    );
    setRecipe(result.recipe);
    setIsCached(result.cached);
    setCurrentScreen("recipe");
  };

  // Regenerate recipe with same ingredients
  const regenerateRecipe = async () => {
    await generateRecipe(true);
  };

  // Reset all state
  const reset = () => {
    setCurrentScreen("landing");
    setSelectedCuisines([]);
    setSelectedIngredients([]);
    setRecipe(null);
    setIsCached(false);
  };

  return (
    <RecipeContext.Provider
      value={{
        currentScreen,
        selectedCuisines,
        selectedIngredients,
        recipe,
        isCached,
        setCurrentScreen,
        setRecipe,
        toggleCuisine,
        toggleIngredient,
        generateRecipe,
        regenerateRecipe,
        reset,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipe() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipe must be used within RecipeProvider");
  }
  return context;
}

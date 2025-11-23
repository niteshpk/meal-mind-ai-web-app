import { createContext, useContext, useState, ReactNode } from "react";
import { Screen, Recipe } from "@/types";
import { RecipeService } from "@/services/recipe-service";

interface RecipeContextType {
  currentScreen: Screen;
  selectedCuisines: string[];
  selectedIngredients: string[];
  recipe: Recipe | null;
  setCurrentScreen: (screen: Screen) => void;
  toggleCuisine: (cuisineId: string) => void;
  toggleIngredient: (ingredientId: string) => void;
  generateRecipe: () => Promise<void>;
  reset: () => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

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
  const generateRecipe = async () => {
    setCurrentScreen("loading");
    // Simulate AI processing with Promise-based delay
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const generatedRecipe = await RecipeService.generateRecipe(
      selectedCuisines,
      selectedIngredients
    );
    setRecipe(generatedRecipe);
    setCurrentScreen("recipe");
  };

  // Reset all state
  const reset = () => {
    setCurrentScreen("landing");
    setSelectedCuisines([]);
    setSelectedIngredients([]);
    setRecipe(null);
  };

  return (
    <RecipeContext.Provider
      value={{
        currentScreen,
        selectedCuisines,
        selectedIngredients,
        recipe,
        setCurrentScreen,
        toggleCuisine,
        toggleIngredient,
        generateRecipe,
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

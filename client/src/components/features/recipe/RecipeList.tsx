import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { RecipeCard } from "./RecipeCard";
import { Recipe } from "@/types";
import { APIService } from "@/services/api-service";

interface RecipeListProps {
  selectedCuisines: string[];
  selectedIngredients: string[];
  onRecipeSelect: (recipe: Recipe) => void;
  onGenerateNew: () => void;
}

export function RecipeList({
  selectedCuisines,
  selectedIngredients,
  onRecipeSelect,
  onGenerateNew,
}: RecipeListProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (selectedIngredients.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const foundRecipes = await APIService.searchRecipes(
          selectedIngredients,
          selectedCuisines
        );
        setRecipes(foundRecipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [selectedCuisines, selectedIngredients]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <span className="ml-3 text-muted-foreground">
          Searching for recipes...
        </span>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Sparkles className="h-12 w-12 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            No recipes found for these ingredients
          </h3>
          <p className="text-muted-foreground mb-6">
            We couldn't find any existing recipes with your selected ingredients.
            Generate a new one!
          </p>
          <Button
            onClick={onGenerateNew}
            className="bg-accent hover:bg-accent-light"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Generate New Recipe
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">
            Found {recipes.length} Recipe{recipes.length !== 1 ? "s" : ""}
          </h2>
          <p className="text-muted-foreground">
            Click on a recipe card to view details, or generate a new one
          </p>
        </div>
        <Button
          onClick={onGenerateNew}
          className="bg-accent hover:bg-accent-light"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Generate New
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard
            key={(recipe as any)._id || recipe.name}
            recipe={recipe}
            onClick={() => onRecipeSelect(recipe)}
          />
        ))}
      </div>
    </div>
  );
}


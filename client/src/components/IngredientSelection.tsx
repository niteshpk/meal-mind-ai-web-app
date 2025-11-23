import { useEffect, useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Ingredient } from "@/types";
import { APIService } from "@/services/api-service";

interface IngredientSelectionProps {
  selectedCuisines: string[];
  selectedIngredients: string[];
  onToggleIngredient: (ingredientId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function IngredientSelection({
  selectedCuisines,
  selectedIngredients,
  onToggleIngredient,
  onNext,
  onBack,
}: IngredientSelectionProps) {
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch ingredients for selected cuisines
  useEffect(() => {
    const fetchIngredients = async () => {
      if (selectedCuisines.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch ingredients for each selected cuisine and combine
        const ingredientPromises = selectedCuisines.map((cuisineId) =>
          APIService.getIngredientsByCuisine(cuisineId)
        );
        const ingredientArrays = await Promise.all(ingredientPromises);

        // Combine and deduplicate ingredients
        const combinedIngredients = ingredientArrays.flat();
        const uniqueIngredients = Array.from(
          new Map(combinedIngredients.map((ing) => [ing.id, ing])).values()
        );

        setAllIngredients(uniqueIngredients);
      } catch (err) {
        setError("Failed to load ingredients. Please try again.");
        console.error("Error fetching ingredients:", err);
        // Fallback: try to get all ingredients
        try {
          const all = await APIService.getIngredients();
          setAllIngredients(all);
        } catch (fallbackErr) {
          console.error("Fallback also failed:", fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, [selectedCuisines]);

  // Filter ingredients based on relevance (already filtered by cuisine from API)
  const relevantIngredients = useMemo(() => {
    return allIngredients;
  }, [allIngredients]);

  // Group ingredients by category
  const groupedIngredients = useMemo(() => {
    return relevantIngredients.reduce((acc, ingredient) => {
      if (!acc[ingredient.category]) {
        acc[ingredient.category] = [];
      }
      acc[ingredient.category].push(ingredient);
      return acc;
    }, {} as Record<string, Ingredient[]>);
  }, [relevantIngredients]);

  const categories = Object.keys(groupedIngredients).sort();

  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge className="mb-4 bg-accent-lighter text-accent">
            Step 2 of 3
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl mb-4">
            Select Your Ingredients
          </h1>
          <p className="text-lg text-muted-foreground">
            Check off the ingredients you have available. We'll create a recipe
            using what you've got!
          </p>
        </div>

        {/* Selected Counter */}
        <div className="max-w-4xl mx-auto mb-8 flex items-center justify-center gap-2">
          <div className="bg-accent-lighter border-accent-light border px-4 py-2 rounded-full">
            <span className="text-sm text-accent">
              {selectedIngredients.length}{" "}
              {selectedIngredients.length === 1 ? "ingredient" : "ingredients"}{" "}
              selected
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <span className="ml-3 text-muted-foreground">
              Loading ingredients...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-4xl mx-auto mb-12 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-center">{error}</p>
          </div>
        )}

        {/* No Ingredients Message */}
        {!loading && !error && relevantIngredients.length === 0 && (
          <div className="max-w-4xl mx-auto mb-12 p-8 text-center">
            <p className="text-muted-foreground">
              No ingredients found for the selected cuisines. Please go back and
              select different cuisines.
            </p>
          </div>
        )}

        {/* Ingredients by Category */}
        {!loading && !error && relevantIngredients.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-8 mb-12">
            {categories.map((category) => (
              <Card key={category} className="p-6">
                <h3 className="mb-6 text-primary">{category}</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {groupedIngredients[category].map((ingredient) => {
                    const isSelected = selectedIngredients.includes(
                      ingredient.id
                    );

                    return (
                      <div
                        key={ingredient.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-muted ${
                          isSelected
                            ? "bg-primary-lighter border-primary"
                            : "border-border"
                        }`}
                        onClick={() => onToggleIngredient(ingredient.id)}
                      >
                        <Checkbox
                          id={ingredient.id}
                          checked={isSelected}
                          onCheckedChange={() =>
                            onToggleIngredient(ingredient.id)
                          }
                          className="pointer-events-none"
                        />
                        <label
                          htmlFor={ingredient.id}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {ingredient.name}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 justify-between">
          <Button variant="outline" size="lg" onClick={onBack}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Cuisines
          </Button>
          <Button
            size="lg"
            disabled={selectedIngredients.length === 0 || loading}
            onClick={onNext}
            className="bg-accent hover:bg-accent-light"
          >
            Generate Recipe
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/features/recipe/RecipeCard";
import { Recipe } from "@/types";
import { RecommendationsService } from "@/services/recommendations-service";
import { TrendingUp, ArrowLeft, Loader2, Star } from "lucide-react";
import { RatingStars } from "@/components/features/ratings/RatingStars";
import { useRecipe } from "@/contexts/RecipeContext";

export function PopularRecipesPage() {
  const navigate = useNavigate();
  const { setRecipe } = useRecipe();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPopularRecipes();
  }, []);

  const loadPopularRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RecommendationsService.getPopular(20);
      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load popular recipes");
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setRecipe(recipe);
    navigate("/recipe");
  };

  if (loading) {
    return (
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  Popular Recipes
                </h1>
                <p className="text-muted-foreground mt-1">
                  Top-rated recipes loved by our community
                </p>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Card className="p-6 mb-8 border-destructive">
              <p className="text-destructive">{error}</p>
              <Button
                variant="outline"
                onClick={loadPopularRecipes}
                className="mt-4"
              >
                Try Again
              </Button>
            </Card>
          )}

          {/* Empty State */}
          {!error && recipes.length === 0 && (
            <Card className="p-12 text-center">
              <Star className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">No popular recipes yet</h2>
              <p className="text-muted-foreground mb-6">
                Recipes need at least 5 ratings with 4+ stars to appear here.
                Start rating recipes to help build our community favorites!
              </p>
              <Button onClick={() => navigate("/cuisine")}>
                Find Recipes
              </Button>
            </Card>
          )}

          {/* Recipes Grid */}
          {!error && recipes.length > 0 && (
            <>
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {recipes.length} popular recipe{recipes.length !== 1 ? "s" : ""} 
                  {" "}(sorted by highest ratings)
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <div key={recipe._id || recipe.name} className="relative">
                    <RecipeCard
                      recipe={recipe}
                      onClick={() => handleRecipeClick(recipe)}
                    />
                    {/* Rating Badge */}
                    {(recipe as any).averageRating && (recipe as any).ratingCount && (
                      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                        <RatingStars 
                          rating={(recipe as any).averageRating} 
                          size="sm" 
                        />
                        <span className="text-xs font-medium text-muted-foreground">
                          {(recipe as any).ratingCount}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


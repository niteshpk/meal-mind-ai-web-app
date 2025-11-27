import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/features/recipe/RecipeCard";
import { Recipe } from "@/types";
import { FavoritesService } from "@/services/favorites-service";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, ArrowLeft, Loader2 } from "lucide-react";

export function FavoritesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/");
        return;
      }
      loadFavorites();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FavoritesService.getFavorites();
      setFavorites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    navigate("/recipe", { state: { recipe } });
  };

  if (authLoading || loading) {
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
                  <Heart className="h-8 w-8 text-primary fill-current" />
                  My Favorites
                </h1>
                <p className="text-muted-foreground mt-1">
                  {favorites.length} saved recipe{favorites.length !== 1 ? "s" : ""}
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
                onClick={loadFavorites}
                className="mt-4"
              >
                Try Again
              </Button>
            </Card>
          )}

          {/* Empty State */}
          {!error && favorites.length === 0 && (
            <Card className="p-12 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-muted-foreground mb-6">
                Start saving your favorite recipes to see them here!
              </p>
              <Button onClick={() => navigate("/cuisine")}>
                Find Recipes
              </Button>
            </Card>
          )}

          {/* Favorites Grid */}
          {!error && favorites.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((recipe) => (
                <RecipeCard
                  key={recipe._id || recipe.name}
                  recipe={recipe}
                  onClick={() => handleRecipeClick(recipe)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/features/recipe/RecipeCard";
import { Recipe } from "@/types";
import { HistoryService, HistoryEntry } from "@/services/history-service";
import { useAuth } from "@/contexts/AuthContext";
import { History, ArrowLeft, Loader2 } from "lucide-react";

export function HistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/");
        return;
      }
      loadHistory();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await HistoryService.getHistory(50);
      setHistory(data.history);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipe: Recipe | null) => {
    if (recipe) {
      navigate("/recipe", { state: { recipe } });
    }
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

  // Filter out entries without recipes
  const validHistory = history.filter((entry) => entry.recipe !== null);

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
                  <History className="h-8 w-8 text-primary" />
                  Recipe History
                </h1>
                <p className="text-muted-foreground mt-1">
                  {validHistory.length} recipe{validHistory.length !== 1 ? "s" : ""} viewed
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
                onClick={loadHistory}
                className="mt-4"
              >
                Try Again
              </Button>
            </Card>
          )}

          {/* Empty State */}
          {!error && validHistory.length === 0 && (
            <Card className="p-12 text-center">
              <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">No history yet</h2>
              <p className="text-muted-foreground mb-6">
                Recipes you view will appear here for easy access!
              </p>
              <Button onClick={() => navigate("/cuisine")}>
                Find Recipes
              </Button>
            </Card>
          )}

          {/* History Grid */}
          {!error && validHistory.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {validHistory.map((entry) => {
                if (!entry.recipe) return null;
                return (
                  <RecipeCard
                    key={entry.recipeId}
                    recipe={entry.recipe}
                    onClick={() => handleRecipeClick(entry.recipe)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


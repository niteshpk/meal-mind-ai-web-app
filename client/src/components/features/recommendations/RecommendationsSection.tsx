import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { RecipeCard } from "@/components/features/recipe/RecipeCard";
import { Recipe } from "@/types";
import { config } from "@/config";
import { AuthService } from "@/services/auth-service";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecommendationsSectionProps {
  recipeId: string;
  type?: "similar" | "for-me" | "trending";
}

export function RecommendationsSection({
  recipeId,
  type = "similar",
}: RecommendationsSectionProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [recipeId, type, isAuthenticated]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      let url = "";

      if (type === "for-me" && isAuthenticated) {
        url = `${config.api.url}/api/recommendations/for-me?limit=6`;
      } else if (type === "trending") {
        url = `${config.api.url}/api/recommendations/trending?limit=6`;
      } else {
        url = `${config.api.url}/api/recommendations/similar/${recipeId}?limit=6`;
      }

      const response = await fetch(url, {
        headers: {
          ...AuthService.getAuthHeader(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecommendations(data.recommendations || data.recipes || []);
        }
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    navigate("/recipe", { state: { recipe } });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  const title =
    type === "for-me"
      ? "Recommended for You"
      : type === "trending"
        ? "Trending Recipes"
        : "You Might Also Like";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recipe) => (
          <RecipeCard
            key={recipe._id || recipe.name}
            recipe={recipe}
            onClick={() => handleRecipeClick(recipe)}
          />
        ))}
      </div>
    </div>
  );
}


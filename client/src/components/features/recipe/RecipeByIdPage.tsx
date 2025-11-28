import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RecipeOutput } from "./RecipeOutput";
import { APIService } from "@/services/api-service";
import { Recipe } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, ArrowLeft, Loader2 } from "lucide-react";

export function RecipeByIdPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadRecipe();
    }
  }, [id]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRecipe = await APIService.getRecipeById(id!);
      if (fetchedRecipe) {
        setRecipe(fetchedRecipe);
      } else {
        setError("Recipe not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    navigate("/");
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

  if (error || !recipe) {
    return (
      <div className="py-12 md:py-16">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <Card className="max-w-2xl mx-auto p-6 sm:p-6 lg:p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-30 h-30 rounded-full bg-accent-lighter mb-6">
                <ChefHat className="h-20 w-20 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-foreground">
                Recipe Not Found
              </h2>
              <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                {error || "The recipe you're looking for doesn't exist or has been removed."}
              </p>
              <Button
                onClick={handleStartOver}
                size="lg"
                className="bg-accent hover:bg-accent-light text-white"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Go Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <RecipeOutput
      recipe={recipe}
      isCached={true}
      onStartOver={handleStartOver}
    />
  );
}


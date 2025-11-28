import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/features/recipe/RecipeCard";
import { Recipe } from "@/types";
import { CustomRecipeService, CustomRecipe } from "@/services/custom-recipe-service";
import { useAuth } from "@/contexts/AuthContext";
import { FileEdit, ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function CustomRecipesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/");
        return;
      }
      loadCustomRecipes();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadCustomRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CustomRecipeService.getCustomRecipes();
      setCustomRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load custom recipes");
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    navigate("/recipe", { state: { recipe } });
  };

  const handleEdit = (recipe: CustomRecipe) => {
    navigate("/custom-recipes/edit", { state: { recipe } });
  };

  const handleDelete = async () => {
    if (!recipeToDelete) return;

    try {
      await CustomRecipeService.deleteCustomRecipe(recipeToDelete);
      await loadCustomRecipes();
      setDeleteDialogOpen(false);
      setRecipeToDelete(null);
    } catch (err) {
      console.error("Error deleting custom recipe:", err);
    }
  };

  const openDeleteDialog = (recipeId: string) => {
    setRecipeToDelete(recipeId);
    setDeleteDialogOpen(true);
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
                  <FileEdit className="h-8 w-8 text-primary" />
                  My Custom Recipes
                </h1>
                <p className="text-muted-foreground mt-1">
                  Your personalized recipe modifications
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/custom-recipes/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Custom Recipe
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <Card className="p-6 mb-8 border-destructive">
              <p className="text-destructive">{error}</p>
              <Button
                variant="outline"
                onClick={loadCustomRecipes}
                className="mt-4"
              >
                Try Again
              </Button>
            </Card>
          )}

          {/* Empty State */}
          {!error && customRecipes.length === 0 && (
            <Card className="p-12 text-center">
              <FileEdit className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">No custom recipes yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your own custom versions of recipes by modifying ingredients,
                instructions, or adding your personal notes!
              </p>
              <Button onClick={() => navigate("/custom-recipes/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Custom Recipe
              </Button>
            </Card>
          )}

          {/* Custom Recipes Grid */}
          {!error && customRecipes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customRecipes.map((recipe) => (
                <div key={recipe._id} className="relative group">
                  <RecipeCard
                    recipe={recipe}
                    onClick={() => handleRecipeClick(recipe)}
                  />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(recipe);
                      }}
                    >
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(recipe._id!);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Custom Recipe?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your custom recipe.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setRecipeToDelete(null)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}


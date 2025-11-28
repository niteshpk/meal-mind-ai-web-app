import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { CustomRecipeService, CustomRecipe } from "@/services/custom-recipe-service";
import { Recipe } from "@/types";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useRecipe } from "@/contexts/RecipeContext";

export function EditCustomRecipePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { recipe: currentRecipe } = useRecipe();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get recipe from location state (if editing) or current recipe context (if creating from current recipe)
  const existingRecipe = location.state?.recipe as CustomRecipe | undefined;
  const sourceRecipe = existingRecipe || currentRecipe;

  const [formData, setFormData] = useState({
    name: sourceRecipe?.name || "",
    description: sourceRecipe?.description || "",
    cuisine: sourceRecipe?.cuisine || "",
    prepTime: sourceRecipe?.prepTime?.replace(" min", "") || "",
    cookTime: sourceRecipe?.cookTime?.replace(" min", "") || "",
    servings: sourceRecipe?.servings || 4,
    difficulty: sourceRecipe?.difficulty || "Medium",
    ingredients: sourceRecipe?.ingredients || [],
    instructions: sourceRecipe?.instructions || [],
    tips: sourceRecipe?.tips || [],
    customNotes: (sourceRecipe as CustomRecipe)?.customNotes || "",
  });

  const [ingredientText, setIngredientText] = useState(
    formData.ingredients.map((ing) => `${ing.amount} ${ing.item}`).join("\n")
  );
  const [instructionsText, setInstructionsText] = useState(
    formData.instructions.join("\n")
  );
  const [tipsText, setTipsText] = useState(formData.tips.join("\n"));

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const parseIngredients = (text: string) => {
    return text
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const trimmed = line.trim();
        // Try to split amount and item (assume first word/number is amount)
        const match = trimmed.match(/^(.+?)\s+(.+)$/);
        if (match) {
          return { amount: match[1].trim(), item: match[2].trim() };
        }
        return { amount: "", item: trimmed };
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const recipeData: Partial<Recipe> = {
        name: formData.name,
        description: formData.description,
        cuisine: formData.cuisine,
        prepTime: `${formData.prepTime} min`,
        cookTime: `${formData.cookTime} min`,
        servings: formData.servings,
        difficulty: formData.difficulty,
        ingredients: parseIngredients(ingredientText),
        instructions: instructionsText.split("\n").filter((line) => line.trim()),
        tips: tipsText.split("\n").filter((line) => line.trim()),
      };

      if (existingRecipe?._id) {
        // Update existing custom recipe
        await CustomRecipeService.updateCustomRecipe(existingRecipe._id, {
          ...recipeData,
          customNotes: formData.customNotes,
        });
      } else {
        // Create new custom recipe
        await CustomRecipeService.createCustomRecipe(
          recipeData,
          sourceRecipe?._id,
          formData.customNotes
        );
      }

      navigate("/custom-recipes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save custom recipe");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate("/custom-recipes")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">
              {existingRecipe ? "Edit Custom Recipe" : "Create Custom Recipe"}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Recipe Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cuisine">Cuisine *</Label>
                    <Input
                      id="cuisine"
                      value={formData.cuisine}
                      onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty *</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) =>
                        setFormData({ ...formData, difficulty: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="prepTime">Prep Time (min) *</Label>
                    <Input
                      id="prepTime"
                      type="number"
                      value={formData.prepTime}
                      onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cookTime">Cook Time (min) *</Label>
                    <Input
                      id="cookTime"
                      type="number"
                      value={formData.cookTime}
                      onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="servings">Servings *</Label>
                    <Input
                      id="servings"
                      type="number"
                      value={formData.servings}
                      onChange={(e) =>
                        setFormData({ ...formData, servings: parseInt(e.target.value) || 4 })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Ingredients */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Ingredients *</h2>
              <Label htmlFor="ingredients" className="text-sm text-muted-foreground mb-2 block">
                Enter one ingredient per line (e.g., "2 cups flour" or "1 tsp salt")
              </Label>
              <Textarea
                id="ingredients"
                value={ingredientText}
                onChange={(e) => setIngredientText(e.target.value)}
                rows={8}
                required
                placeholder="2 cups flour&#10;1 tsp salt&#10;3 eggs"
              />
            </Card>

            {/* Instructions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Instructions *</h2>
              <Label htmlFor="instructions" className="text-sm text-muted-foreground mb-2 block">
                Enter one step per line
              </Label>
              <Textarea
                id="instructions"
                value={instructionsText}
                onChange={(e) => setInstructionsText(e.target.value)}
                rows={10}
                required
                placeholder="Step 1: Mix dry ingredients&#10;Step 2: Add wet ingredients&#10;Step 3: Bake at 350°F"
              />
            </Card>

            {/* Tips */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Tips (Optional)</h2>
              <Label htmlFor="tips" className="text-sm text-muted-foreground mb-2 block">
                Enter one tip per line
              </Label>
              <Textarea
                id="tips"
                value={tipsText}
                onChange={(e) => setTipsText(e.target.value)}
                rows={4}
                placeholder="Tip 1: Use room temperature eggs&#10;Tip 2: Don't overmix the batter"
              />
            </Card>

            {/* Custom Notes */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Personal Notes (Optional)</h2>
              <Label htmlFor="customNotes" className="text-sm text-muted-foreground mb-2 block">
                Add your personal notes or modifications
              </Label>
              <Textarea
                id="customNotes"
                value={formData.customNotes}
                onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
                rows={4}
                placeholder="I like to add extra garlic..."
              />
            </Card>

            {/* Error Message */}
            {error && (
              <Card className="p-4 border-destructive">
                <p className="text-destructive">{error}</p>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/custom-recipes")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {existingRecipe ? "Update Recipe" : "Create Recipe"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


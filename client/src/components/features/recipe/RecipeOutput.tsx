import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Users,
  ChefHat,
  Printer,
  Share2,
  Heart,
  ArrowLeft,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Recipe } from "@/types";
import { formatTime, calculateTotalTime } from "@/utils/format";
import { APIService } from "@/services/api-service";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { scaleRecipe } from "@/utils/scaling";
import { ShoppingList } from "@/components/ShoppingList";
import { recipeToShoppingList } from "@/utils/shopping";
import { useAuth } from "@/contexts/AuthContext";
import { FavoritesService } from "@/services/favorites-service";
import { HistoryService } from "@/services/history-service";

interface RecipeOutputProps {
  recipe: Recipe;
  isCached?: boolean;
  onStartOver: () => void;
  onRegenerate?: () => void;
}

export function RecipeOutput({
  recipe,
  isCached = false,
  onStartOver,
  onRegenerate,
}: RecipeOutputProps) {
  const { isAuthenticated } = useAuth();
  const [printing, setPrinting] = useState(false);
  const [currentServings, setCurrentServings] = useState(recipe.servings);
  const [scaledRecipe, setScaledRecipe] = useState<Recipe>(recipe);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Update scaled recipe when servings change
  useEffect(() => {
    if (currentServings !== recipe.servings) {
      setScaledRecipe(scaleRecipe(recipe, currentServings));
    } else {
      setScaledRecipe(recipe);
    }
  }, [currentServings, recipe]);

  // Check if recipe is favorited and track in history
  useEffect(() => {
    if (isAuthenticated && recipe._id) {
      // Check favorite status
      FavoritesService.checkFavorite(recipe._id)
        .then(setIsFavorite)
        .catch(() => setIsFavorite(false));

      // Track in history
      HistoryService.addToHistory(recipe._id).catch(() => {
        // Silently fail - history tracking is optional
      });
    }
  }, [isAuthenticated, recipe._id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !recipe._id) {
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await FavoritesService.removeFavorite(recipe._id);
        setIsFavorite(false);
      } else {
        await FavoritesService.addFavorite(recipe._id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!recipe._id) {
      console.error("Recipe has no ID");
      return;
    }

    try {
      setPrinting(true);
      await APIService.printRecipe(recipe._id);
    } catch (error) {
      console.error("Error printing recipe:", error);
      // Fallback to browser print
      window.print();
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Image & Title */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="overflow-hidden">
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1761315631508-eb81f826e6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpY2lvdXMlMjBwbGF0ZWQlMjBtZWFsfGVufDF8fHx8MTc2Mzg4NTc3Mnww&ixlib=rb-4.1.0&q=80&w=1080"
                alt={recipe.name}
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button size="sm" variant="secondary" className="rounded-full">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary" className="rounded-full">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-primary text-primary-foreground">
                  {recipe.cuisine}
                </Badge>
                <Badge variant="outline">{recipe.difficulty}</Badge>
                <Badge className="bg-accent-lighter text-accent">
                  AI Generated
                </Badge>
                {isCached && (
                  <Badge
                    variant="outline"
                    className="border-blue-300 text-blue-600"
                  >
                    From Cache
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl mb-4">{recipe.name}</h1>
              <p className="text-lg text-muted-foreground mb-6">
                {recipe.description}
              </p>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Prep</div>
                    <div className="text-sm">{formatTime(recipe.prepTime)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <ChefHat className="h-5 w-5 text-accent" />
                  <div>
                    <div className="text-xs text-muted-foreground">Cook</div>
                    <div className="text-sm">{formatTime(recipe.cookTime)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 text-accent" />
                  <div>
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="text-sm">
                      {calculateTotalTime(recipe.prepTime, recipe.cookTime)} min
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg md:col-span-3">
                  <Users className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-3">
                      Servings
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground min-w-[2rem]">
                        {currentServings}
                      </span>
                      <div className="flex-1 min-w-0 px-2">
                        <Slider
                          value={[currentServings]}
                          onValueChange={(value) =>
                            setCurrentServings(value[0])
                          }
                          min={1}
                          max={12}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground min-w-[2rem] text-right">
                        12
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground"></span>
                      <span className="text-xs font-semibold text-primary">
                        {currentServings}{" "}
                        {currentServings === 1 ? "serving" : "servings"}
                      </span>
                      {currentServings !== recipe.servings && (
                        <button
                          onClick={() => setCurrentServings(recipe.servings)}
                          className="text-xs text-primary hover:underline"
                        >
                          Reset to {recipe.servings}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 mb-12">
          {/* Ingredients */}
          <div className="md:col-span-1">
            <Card className="p-6 sticky top-24 gap-2">
              <h2 className="text-xl ">Ingredients</h2>
              <Separator className="mb-4" />
              <ul className="space-y-3">
                {scaledRecipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm flex-1">
                      <span className="text-primary">{ingredient.amount}</span>{" "}
                      {ingredient.item}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Instructions */}
          <div className="md:col-span-2 space-y-8">
            <Card className="p-6  gap-2">
              <h2 className="text-xl ">Instructions</h2>
              <Separator className="mb-6" />
              <ol className="space-y-6">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      {index + 1}
                    </div>
                    <p className="flex-1 pt-1">{instruction}</p>
                  </li>
                ))}
              </ol>
            </Card>

            {/* Chef's Tips */}
            {recipe.tips.length > 0 && (
              <Card className="p-6 bg-accent-lighter border-accent">
                <div className="flex items-center gap-2 mb-4">
                  <ChefHat className="h-5 w-5 text-accent" />
                  <h3 className="text-accent">Chef's Tips</h3>
                </div>
                <ul className="space-y-3">
                  {recipe.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>

        {/* Shopping List */}
        {showShoppingList && (
          <div className="max-w-4xl mx-auto mb-12">
            <ShoppingList
              items={recipeToShoppingList(scaledRecipe)}
              recipeName={scaledRecipe.name}
            />
          </div>
        )}

        {/* Actions */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button variant="outline" onClick={onStartOver}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Create Another Recipe
              </Button>
              <div className="flex gap-3">
                {isCached && onRegenerate && (
                  <Button
                    variant="outline"
                    onClick={onRegenerate}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Recipe
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowShoppingList(!showShoppingList)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {showShoppingList ? "Hide" : "Show"} Shopping List
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  disabled={printing}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  {printing ? "Generating PDF..." : "Print Recipe"}
                </Button>
                {isAuthenticated ? (
                  <Button
                    onClick={handleToggleFavorite}
                    disabled={favoriteLoading}
                    variant={isFavorite ? "default" : "outline"}
                    className={isFavorite ? "bg-primary hover:bg-primary-light" : ""}
                  >
                    <Heart
                      className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                    />
                    {favoriteLoading
                      ? "Loading..."
                      : isFavorite
                        ? "Saved"
                        : "Save to Favorites"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Trigger login dialog - will be handled by Header
                      window.dispatchEvent(new CustomEvent("openLogin"));
                    }}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Sign in to Save
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

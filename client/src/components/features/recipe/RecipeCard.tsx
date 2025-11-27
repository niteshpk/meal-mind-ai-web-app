import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat } from "lucide-react";
import { Recipe } from "@/types";
import { formatTime, calculateTotalTime } from "@/utils/format";

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  // Safety check - ensure recipe has required fields
  if (!recipe || !recipe.name) {
    return null;
  }

  return (
    <Card
      className="p-6 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col"
      onClick={onClick}
    >
      <div className="flex-1">
        <div className="flex flex-wrap gap-2 mb-3">
          {recipe.cuisine && (
            <Badge className="bg-primary text-primary-foreground text-xs">
              {recipe.cuisine}
            </Badge>
          )}
          {recipe.difficulty && (
            <Badge variant="outline" className="text-xs">
              {recipe.difficulty}
            </Badge>
          )}
        </div>

        <h3 className="text-xl font-semibold mb-2 line-clamp-2">
          {recipe.name}
        </h3>
        {recipe.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {recipe.description}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">
              {recipe.prepTime ? formatTime(recipe.prepTime) : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="h-3 w-3 text-accent" />
            <span className="text-muted-foreground">
              {recipe.cookTime ? formatTime(recipe.cookTime) : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">
              {recipe.servings || "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          {recipe.ingredients?.length || 0} ingredients
          {recipe.prepTime && recipe.cookTime && (
            <> • {calculateTotalTime(recipe.prepTime, recipe.cookTime)} min total</>
          )}
        </p>
      </div>
    </Card>
  );
}

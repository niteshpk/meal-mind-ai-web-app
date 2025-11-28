import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { config } from "@/config";
import { AuthService } from "@/services/auth-service";
import { useAuth } from "@/contexts/AuthContext";

interface SubstitutionSuggestionsProps {
  recipeId: string;
  ingredientName?: string;
}

export function SubstitutionSuggestions({
  recipeId,
  ingredientName,
}: SubstitutionSuggestionsProps) {
  const { isAuthenticated } = useAuth();
  const [substitutions, setSubstitutions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recipeId) {
      loadSubstitutions();
    }
  }, [recipeId]);

  const loadSubstitutions = async () => {
    try {
      setLoading(true);
      const url = ingredientName
        ? `${config.api.url}/api/substitutions/ingredient/${encodeURIComponent(ingredientName)}`
        : `${config.api.url}/api/substitutions/recipe/${recipeId}`;

      const response = await fetch(url, {
        headers: {
          ...AuthService.getAuthHeader(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (ingredientName) {
            setSubstitutions({
              [ingredientName]: data.substitutions || [],
            });
          } else {
            setSubstitutions(data.substitutions || {});
          }
        }
      }
    } catch (error) {
      console.error("Error loading substitutions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  const entries = Object.entries(substitutions).filter(([_, subs]) => subs.length > 0);

  if (entries.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold">Ingredient Substitutions</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadSubstitutions}
          disabled={loading}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-3">
        {entries.map(([ingredient, subs]) => (
          <div key={ingredient}>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Don't have <span className="font-semibold text-foreground">{ingredient}</span>?
            </p>
            <div className="flex flex-wrap gap-1.5">
              {subs.map((sub, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {sub}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}


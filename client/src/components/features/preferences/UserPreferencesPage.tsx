import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DietaryFilters } from "@/components/DietaryFilters";
import { DietaryRestriction } from "@/types/dietary";
import { useAuth } from "@/contexts/AuthContext";
import { AuthService } from "@/services/auth-service";
import { APIService } from "@/services/api-service";
import { Cuisine } from "@/types";
import { ArrowLeft, Save, Loader2, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function UserPreferencesPage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestriction[]>([]);
  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>([]);
  const [availableCuisines, setAvailableCuisines] = useState<Cuisine[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/");
        return;
      }
      loadPreferences();
      loadCuisines();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadPreferences = () => {
    if (user?.preferences) {
      setDietaryRestrictions(
        (user.preferences.defaultDietaryRestrictions || []) as DietaryRestriction[]
      );
      setFavoriteCuisines(user.preferences.favoriteCuisines || []);
    }
  };

  const loadCuisines = async () => {
    try {
      const cuisines = await APIService.getCuisines();
      setAvailableCuisines(cuisines);
    } catch (err) {
      console.error("Error loading cuisines:", err);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      await AuthService.updatePreferences({
        defaultDietaryRestrictions: dietaryRestrictions,
        favoriteCuisines: favoriteCuisines,
      });
      
      // Refresh user data to get updated preferences
      await refreshUser();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const toggleCuisine = (cuisineId: string) => {
    setFavoriteCuisines((prev) =>
      prev.includes(cuisineId)
        ? prev.filter((id) => id !== cuisineId)
        : [...prev, cuisineId]
    );
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Settings className="h-8 w-8 text-primary" />
                Preferences
              </h1>
              <p className="text-muted-foreground mt-1">
                Customize your default recipe generation settings
              </p>
            </div>
          </div>

          {/* Default Dietary Restrictions */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Default Dietary Restrictions</h2>
            <p className="text-sm text-muted-foreground mb-4">
              These restrictions will be automatically applied when you start generating recipes.
              You can still modify them on the ingredients selection page.
            </p>
            <DietaryFilters
              restrictions={dietaryRestrictions}
              onChange={setDietaryRestrictions}
            />
          </Card>

          {/* Favorite Cuisines */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Favorite Cuisines</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select your favorite cuisines. These will be pre-selected when you start generating recipes.
            </p>
            <div className="flex flex-wrap gap-2">
              {availableCuisines.map((cuisine) => (
                <Badge
                  key={cuisine.id}
                  variant={favoriteCuisines.includes(cuisine.id) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors text-sm py-2 px-3"
                  onClick={() => toggleCuisine(cuisine.id)}
                >
                  {favoriteCuisines.includes(cuisine.id) && "✓ "}
                  {cuisine.name}
                </Badge>
              ))}
            </div>
            {availableCuisines.length === 0 && (
              <p className="text-sm text-muted-foreground">Loading cuisines...</p>
            )}
          </Card>

          {/* Success/Error Messages */}
          {success && (
            <Card className="p-4 mb-6 border-green-500 bg-green-50 dark:bg-green-900/20">
              <p className="text-green-700 dark:text-green-300">
                Preferences saved successfully!
              </p>
            </Card>
          )}
          {error && (
            <Card className="p-4 mb-6 border-destructive">
              <p className="text-destructive">{error}</p>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


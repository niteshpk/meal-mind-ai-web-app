import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Landing } from "@/components/Landing";
import { CuisineSelection } from "@/components/features/selection/CuisineSelection";
import { IngredientSelection } from "@/components/features/selection/IngredientSelection";
import { AILoading } from "@/components/AILoading";
import { RecipeOutput } from "@/components/features/recipe/RecipeOutput";
import { RecipeList } from "@/components/features/recipe/RecipeList";
import { FavoritesPage } from "@/components/features/favorites/FavoritesPage";
import { HistoryPage } from "@/components/features/history/HistoryPage";
import { MealPlanningPage } from "@/components/features/meal-planning/MealPlanningPage";
import { PopularRecipesPage } from "@/components/features/popular/PopularRecipesPage";
import { RecipeByIdPage } from "@/components/features/recipe/RecipeByIdPage";
import { CustomRecipesPage } from "@/components/features/custom-recipes/CustomRecipesPage";
import { EditCustomRecipePage } from "@/components/features/custom-recipes/EditCustomRecipePage";
import { UserPreferencesPage } from "@/components/features/preferences/UserPreferencesPage";
import { useRecipe } from "@/contexts/RecipeContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChefHat, ArrowLeft } from "lucide-react";

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    selectedCuisines,
    selectedIngredients,
    dietaryRestrictions,
    recipe,
    isCached,
    toggleCuisine,
    toggleIngredient,
    setDietaryRestrictions,
    generateRecipe,
    regenerateRecipe,
    reset,
    setRecipe,
    setCurrentScreen,
  } = useRecipe();
  
  // Preserve mealPlanContext through navigation
  const mealPlanContext = (location.state as { mealPlanContext?: { day: string; mealType: string; weekStartDate: string } } | null)?.mealPlanContext;

  const handleStartOver = () => {
    reset();
    setCurrentScreen("cuisine");
    navigate("/cuisine");
  };

  // Navigate to recipe page when recipe is generated
  useEffect(() => {
    if (recipe && window.location.pathname === "/loading") {
      navigate("/recipe", {
        state: mealPlanContext ? { mealPlanContext } : undefined,
      });
    }
  }, [recipe, navigate, mealPlanContext]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Landing
                onGetStarted={() => {
                  setCurrentScreen("cuisine");
                  navigate("/cuisine");
                }}
              />
            }
          />
          <Route
            path="/cuisine"
            element={
              <CuisineSelection
                selectedCuisines={selectedCuisines}
                onToggleCuisine={toggleCuisine}
                onNext={() => {
                  setCurrentScreen("ingredients");
                  navigate("/ingredients");
                }}
                onBack={() => {
                  setCurrentScreen("landing");
                  navigate("/");
                }}
                onMount={() => setCurrentScreen("cuisine")}
              />
            }
          />
          <Route
            path="/ingredients"
            element={
              <IngredientSelection
                selectedCuisines={selectedCuisines}
                selectedIngredients={selectedIngredients}
                dietaryRestrictions={dietaryRestrictions}
                onToggleIngredient={toggleIngredient}
                onDietaryRestrictionsChange={setDietaryRestrictions}
                onNext={async () => {
                  navigate("/loading", {
                    state: mealPlanContext ? { mealPlanContext } : undefined,
                  });
                  await generateRecipe();
                  // Navigation will happen automatically via useEffect when recipe is set
                }}
                onBack={() => navigate("/cuisine", {
                  state: mealPlanContext ? { mealPlanContext } : undefined,
                })}
                onViewRecipes={() => navigate("/recipes", {
                  state: mealPlanContext ? { mealPlanContext } : undefined,
                })}
              />
            }
          />
          <Route
            path="/recipes"
            element={
              <div className="py-12 md:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <RecipeList
                    selectedCuisines={selectedCuisines}
                    selectedIngredients={selectedIngredients}
                    onRecipeSelect={(recipe) => {
                      setRecipe(recipe);
                      navigate("/recipe", {
                        state: mealPlanContext ? { mealPlanContext } : undefined,
                      });
                    }}
                    onGenerateNew={async () => {
                      navigate("/loading", {
                        state: mealPlanContext ? { mealPlanContext } : undefined,
                      });
                      await generateRecipe(true); // Force regenerate
                    }}
                  />
                </div>
              </div>
            }
          />
          <Route path="/loading" element={<AILoading />} />
          <Route
            path="/recipe"
            element={
              recipe ? (
                <RecipeOutput
                  recipe={recipe}
                  isCached={isCached}
                  onStartOver={handleStartOver}
                  onRegenerate={async () => {
                    navigate("/loading");
                    await regenerateRecipe();
                  }}
                />
              ) : (
                <div className="py-12 md:py-16">
                  <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                    <Card className="max-w-2xl mx-auto p-6 sm:p-6 lg:p-8">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-30 h-30 rounded-full bg-accent-lighter mb-6">
                          <ChefHat className="h-20 w-20 text-accent" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-foreground">
                          No Recipe Found
                        </h2>
                        <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                          It looks like there's no recipe available at the
                          moment. Start fresh by selecting your cuisines and
                          ingredients to generate a new recipe!
                        </p>
                        <Button
                          onClick={handleStartOver}
                          size="lg"
                          className="bg-accent hover:bg-accent-light text-white"
                        >
                          <ArrowLeft className="mr-2 h-5 w-5" />
                          Start Again
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              )
            }
          />
          <Route path="/recipe/:id" element={<RecipeByIdPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/meal-planning" element={<MealPlanningPage />} />
                <Route path="/popular" element={<PopularRecipesPage />} />
                <Route path="/custom-recipes" element={<CustomRecipesPage />} />
                <Route path="/custom-recipes/create" element={<EditCustomRecipePage />} />
                <Route path="/custom-recipes/edit" element={<EditCustomRecipePage />} />
                <Route path="/preferences" element={<UserPreferencesPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

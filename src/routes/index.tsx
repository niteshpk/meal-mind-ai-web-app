import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Landing } from "@/components/Landing";
import { CuisineSelection } from "@/components/features/selection/CuisineSelection";
import { IngredientSelection } from "@/components/features/selection/IngredientSelection";
import { AILoading } from "@/components/AILoading";
import { RecipeOutput } from "@/components/features/recipe/RecipeOutput";
import { useRecipe } from "@/contexts/RecipeContext";

function AppRoutes() {
  const navigate = useNavigate();
  const {
    selectedCuisines,
    selectedIngredients,
    recipe,
    toggleCuisine,
    toggleIngredient,
    generateRecipe,
    reset,
  } = useRecipe();

  const handleStartOver = () => {
    reset();
    navigate("/");
  };

  // Navigate to recipe page when recipe is generated
  useEffect(() => {
    if (recipe && window.location.pathname === "/loading") {
      navigate("/recipe");
    }
  }, [recipe, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={<Landing onGetStarted={() => navigate("/cuisine")} />}
          />
          <Route
            path="/cuisine"
            element={
              <CuisineSelection
                selectedCuisines={selectedCuisines}
                onToggleCuisine={toggleCuisine}
                onNext={() => navigate("/ingredients")}
                onBack={() => navigate("/")}
              />
            }
          />
          <Route
            path="/ingredients"
            element={
              <IngredientSelection
                selectedCuisines={selectedCuisines}
                selectedIngredients={selectedIngredients}
                onToggleIngredient={toggleIngredient}
                onNext={async () => {
                  navigate("/loading");
                  await generateRecipe();
                  // Navigation will happen automatically via useEffect when recipe is set
                }}
                onBack={() => navigate("/cuisine")}
              />
            }
          />
          <Route path="/loading" element={<AILoading />} />
          <Route
            path="/recipe"
            element={
              recipe ? (
                <RecipeOutput recipe={recipe} onStartOver={handleStartOver} />
              ) : (
                <div>No recipe found</div>
              )
            }
          />
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


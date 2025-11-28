import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MealPlanService, MealPlan, MealPlanMeal } from "@/services/meal-plan-service";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, ArrowLeft, Plus, Loader2, Trash2, ShoppingCart } from "lucide-react";
import { Recipe } from "@/types";
import { MultiRecipeShoppingList } from "./MultiRecipeShoppingList";
import { APIService } from "@/services/api-service";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPES: Array<"breakfast" | "lunch" | "dinner" | "snack"> = ["breakfast", "lunch", "dinner", "snack"];

export function MealPlanningPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/");
        return;
      }
      loadMealPlan();
    }
  }, [isAuthenticated, authLoading, currentWeek]);

  // Handle recipe selection from navigation state
  useEffect(() => {
    const state = location.state as { recipeId?: string; day?: string; mealType?: string; weekStartDate?: string } | null;
    if (state?.recipeId && state?.day && state?.mealType) {
      // Check if weekStartDate matches current week
      const stateWeekStart = state.weekStartDate ? new Date(state.weekStartDate) : null;
      const weekMatches = !stateWeekStart || 
        stateWeekStart.getTime() === currentWeek.getTime();
      
      if (weekMatches) {
        // Fetch recipe and add to meal plan
        APIService.getRecipeById(state.recipeId)
          .then((recipe) => {
            handleAddMeal(state.day!, state.mealType!, recipe);
            toast.success(`Added ${recipe.name} to ${state.day} ${state.mealType}`);
            // Clear navigation state
            navigate(location.pathname, { replace: true, state: {} });
          })
          .catch((error) => {
            console.error("Error fetching recipe:", error);
            toast.error("Failed to add recipe to meal plan");
          });
      }
    }
  }, [location.state, currentWeek]);

  const loadMealPlan = async () => {
    try {
      setLoading(true);
      const plan = await MealPlanService.getMealPlan(currentWeek);
      setMealPlan(plan);
    } catch (error) {
      console.error("Error loading meal plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMealForSlot = (day: string, mealType: string): MealPlanMeal | null => {
    if (!mealPlan) return null;
    return mealPlan.meals.find((m) => m.day === day && m.mealType === mealType) || null;
  };

  const handleAddMeal = async (day: string, mealType: string, recipe: Recipe) => {
    if (!mealPlan) {
      // Create new meal plan
      const newMeals: Omit<MealPlanMeal, "recipeName">[] = [
        {
          day,
          mealType,
          recipeId: recipe._id || "",
          notes: "",
        },
      ];
      try {
        setSaving(true);
        const created = await MealPlanService.saveMealPlan(currentWeek, newMeals);
        setMealPlan(created);
      } catch (error) {
        console.error("Error creating meal plan:", error);
      } finally {
        setSaving(false);
      }
    } else {
      // Update existing meal plan
      const existingMeals = mealPlan.meals.filter(
        (m) => !(m.day === day && m.mealType === mealType)
      );
      const updatedMeals: Omit<MealPlanMeal, "recipeName">[] = [
        ...existingMeals,
        {
          day,
          mealType,
          recipeId: recipe._id || "",
          notes: "",
        },
      ];
      try {
        setSaving(true);
        const updated = await MealPlanService.saveMealPlan(currentWeek, updatedMeals);
        setMealPlan(updated);
      } catch (error) {
        console.error("Error updating meal plan:", error);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleRemoveMeal = async (day: string, mealType: string) => {
    if (!mealPlan) return;

    const updatedMeals = mealPlan.meals.filter(
      (m) => !(m.day === day && m.mealType === mealType)
    );

    try {
      setSaving(true);
      const updated = await MealPlanService.saveMealPlan(currentWeek, updatedMeals);
      setMealPlan(updated);
    } catch (error) {
      console.error("Error removing meal:", error);
    } finally {
      setSaving(false);
    }
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeek);
      date.setDate(currentWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newWeek);
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

  const weekDates = getWeekDates();

  // Show shopping list if requested
  if (showShoppingList) {
    return (
      <MultiRecipeShoppingList
        weekStartDate={currentWeek}
        onBack={() => setShowShoppingList(false)}
      />
    );
  }

  const hasMeals = mealPlan && mealPlan.meals && mealPlan.meals.length > 0;

  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Calendar className="h-8 w-8 text-primary" />
                  Meal Planning
                </h1>
                <p className="text-muted-foreground mt-1">
                  Plan your meals for the week
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigateWeek("prev")}>
                Previous Week
              </Button>
              <Button variant="outline" onClick={() => navigateWeek("next")}>
                Next Week
              </Button>
            </div>
          </div>

          {/* Week Overview */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-sm text-muted-foreground mb-1">Week of</p>
                <p className="text-lg font-semibold">
                  {currentWeek.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {hasMeals && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {mealPlan!.meals.length} meal{mealPlan!.meals.length !== 1 ? "s" : ""} planned
                  </p>
                )}
              </div>
              {hasMeals && (
                <Button
                  onClick={() => setShowShoppingList(true)}
                  className="ml-4"
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Generate Shopping List
                </Button>
              )}
            </div>
          </Card>

          {/* Meal Plan Grid */}
          <div className="space-y-4">
            {DAYS.map((day, dayIndex) => (
              <Card key={day} className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-24 flex-shrink-0">
                    <p className="font-semibold">{day}</p>
                    <p className="text-xs text-muted-foreground">
                      {weekDates[dayIndex].toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    {MEAL_TYPES.map((mealType) => {
                      const meal = getMealForSlot(day, mealType);
                      return (
                        <div
                          key={mealType}
                          className="border rounded-lg p-2 min-h-[80px] flex flex-col"
                        >
                          <p className="text-xs font-medium text-muted-foreground mb-1 capitalize">
                            {mealType}
                          </p>
                          {meal ? (
                            <div className="flex-1 flex flex-col">
                              <p className="text-sm font-medium line-clamp-2 flex-1">
                                {meal.recipeName}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 h-6 text-xs"
                                onClick={() => handleRemoveMeal(day, mealType)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-auto text-xs"
                              onClick={() => {
                                // Navigate to recipe selection with meal plan context
                                navigate("/cuisine", {
                                  state: {
                                    mealPlanContext: {
                                      day,
                                      mealType,
                                      weekStartDate: currentWeek.toISOString(),
                                    },
                                  },
                                });
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {saving && (
            <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
              Saving...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


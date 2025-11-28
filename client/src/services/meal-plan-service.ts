import { config } from "@/config";
import { AuthService } from "./auth-service";
import { Recipe } from "@/types";

export interface MealPlanMeal {
  day: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  recipeId: string;
  recipeName: string;
  recipe?: Recipe;
  notes?: string;
}

export interface MealPlan {
  _id: string;
  userId: string;
  weekStartDate: string;
  meals: MealPlanMeal[];
  createdAt?: string;
  updatedAt?: string;
}

export class MealPlanService {
  /**
   * Create or update a meal plan
   */
  static async saveMealPlan(
    weekStartDate: Date,
    meals: Omit<MealPlanMeal, "recipeName">[]
  ): Promise<MealPlan> {
    const response = await fetch(`${config.api.url}/api/meal-plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        weekStartDate: weekStartDate.toISOString(),
        meals,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to save meal plan");
    }

    const data = await response.json();
    return data.success ? data.mealPlan : null;
  }

  /**
   * Get user's meal plans
   */
  static async getMealPlans(limit = 10): Promise<MealPlan[]> {
    const response = await fetch(
      `${config.api.url}/api/meal-plans?limit=${limit}`,
      {
        headers: {
          ...AuthService.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.success ? (data.mealPlans || []) : [];
  }

  /**
   * Get specific meal plan for a week
   */
  static async getMealPlan(weekStartDate: Date): Promise<MealPlan | null> {
    const response = await fetch(
      `${config.api.url}/api/meal-plans/${weekStartDate.toISOString()}`,
      {
        headers: {
          ...AuthService.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.mealPlan : null;
  }

  /**
   * Delete a meal plan
   */
  static async deleteMealPlan(weekStartDate: Date): Promise<void> {
    const response = await fetch(
      `${config.api.url}/api/meal-plans/${weekStartDate.toISOString()}`,
      {
        method: "DELETE",
        headers: {
          ...AuthService.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete meal plan");
    }
  }

  /**
   * Get combined shopping list from meal plan
   */
  static async getShoppingList(weekStartDate: Date): Promise<{
    shoppingList: Array<{
      id: string;
      name: string;
      amount: string;
      recipes: string[];
    }>;
    recipes: Array<{ id: string; name: string }>;
    weekStartDate: string;
  }> {
    const response = await fetch(
      `${config.api.url}/api/meal-plans/${weekStartDate.toISOString()}/shopping-list`,
      {
        headers: {
          ...AuthService.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to generate shopping list");
    }

    const data = await response.json();
    return data.success ? data : null;
  }
}


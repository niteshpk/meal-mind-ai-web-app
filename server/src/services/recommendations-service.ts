import { Recipe } from "../models/Recipe";
import { User } from "../models/User";
import { Review } from "../models/Review";

export class RecommendationsService {
  /**
   * Get similar recipes based on cuisines and ingredients
   */
  static async getSimilarRecipes(
    recipeId: string,
    limit: number = 5
  ): Promise<any[]> {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return [];
    }

    // Find recipes with similar cuisines or ingredients
    const similarRecipes = await Recipe.find({
      _id: { $ne: recipeId },
      $or: [
        { cuisines: { $in: recipe.cuisines } },
        { ingredientIds: { $in: recipe.ingredientIds } },
      ],
    })
      .limit(limit * 2) // Get more to filter
      .sort({ createdAt: -1 });

    // Score recipes by similarity
    const scored = similarRecipes.map((r) => {
      const cuisineMatch = r.cuisines.filter((c) =>
        recipe.cuisines.includes(c)
      ).length;
      const ingredientMatch = r.ingredientIds.filter((i) =>
        recipe.ingredientIds.includes(i)
      ).length;
      const score = cuisineMatch * 2 + ingredientMatch; // Weight cuisines more

      return { recipe: r, score };
    });

    // Sort by score and return top results
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.recipe);
  }

  /**
   * Get trending recipes (most rated in last 30 days)
   */
  static async getTrendingRecipes(limit: number = 10): Promise<any[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recipes with recent reviews
    const recentReviews = await Review.find({
      createdAt: { $gte: thirtyDaysAgo },
    }).distinct("recipeId");

    const recipes = await Recipe.find({
      _id: { $in: recentReviews },
      ratingCount: { $gte: 3 }, // At least 3 ratings
    })
      .sort({ averageRating: -1, ratingCount: -1 })
      .limit(limit);

    return recipes;
  }

  /**
   * Get recommendations based on user's history
   */
  static async getRecommendationsForUser(
    userId: string,
    limit: number = 10
  ): Promise<any[]> {
    const user = await User.findById(userId).populate("recipeHistory.recipeId");
    if (!user || user.recipeHistory.length === 0) {
      // If no history, return trending recipes
      return this.getTrendingRecipes(limit);
    }

    // Get all cuisines and ingredients from user's history
    const historyRecipes = user.recipeHistory
      .map((h) => (h.recipeId as any))
      .filter(Boolean);

    if (historyRecipes.length === 0) {
      return this.getTrendingRecipes(limit);
    }

    const preferredCuisines = new Set<string>();
    const preferredIngredients = new Set<string>();

    historyRecipes.forEach((recipe: any) => {
      if (recipe.cuisines) {
        recipe.cuisines.forEach((c: string) => preferredCuisines.add(c));
      }
      if (recipe.ingredientIds) {
        recipe.ingredientIds.forEach((i: string) => preferredIngredients.add(i));
      }
    });

    // Find recipes matching preferences that user hasn't viewed
    const viewedIds = historyRecipes.map((r: any) => r._id.toString());
    const recommendations = await Recipe.find({
      _id: { $nin: viewedIds },
      $or: [
        { cuisines: { $in: Array.from(preferredCuisines) } },
        { ingredientIds: { $in: Array.from(preferredIngredients) } },
      ],
    })
      .sort({ averageRating: -1, createdAt: -1 })
      .limit(limit);

    // If not enough recommendations, fill with trending
    if (recommendations.length < limit) {
      const trending = await this.getTrendingRecipes(limit - recommendations.length);
      const trendingIds = recommendations.map((r) => r._id.toString());
      const additional = trending.filter(
        (t) => !trendingIds.includes(t._id.toString())
      );
      recommendations.push(...additional);
    }

    return recommendations.slice(0, limit);
  }

  /**
   * Get popular recipes (highest rated with minimum reviews)
   */
  static async getPopularRecipes(limit: number = 10): Promise<any[]> {
    return Recipe.find({
      ratingCount: { $gte: 5 }, // At least 5 ratings
      averageRating: { $gte: 4 }, // At least 4 stars
    })
      .sort({ averageRating: -1, ratingCount: -1 })
      .limit(limit);
  }
}


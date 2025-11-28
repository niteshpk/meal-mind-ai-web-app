import { Router, Response } from "express";
import { Recipe } from "../models/Recipe";
import { Review } from "../models/Review";
import { authenticateToken, optionalAuth, AuthRequest } from "../middleware/auth";

const router: Router = Router();

/**
 * POST /api/ratings/:recipeId
 * Add or update rating for a recipe
 */
router.post("/:recipeId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { recipeId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user!.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5",
      });
    }

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: "Recipe not found",
      });
    }

    // Upsert review (update if exists, create if not)
    const review = await Review.findOneAndUpdate(
      { recipeId, userId },
      {
        recipeId,
        userId,
        rating,
        comment: comment || undefined,
      },
      { upsert: true, new: true }
    );

    // Recalculate average rating
    const reviews = await Review.find({ recipeId });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const ratingCount = reviews.length;

    // Update recipe with new rating stats
    await Recipe.findByIdAndUpdate(recipeId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      ratingCount,
    });

    res.json({
      success: true,
      review: {
        id: review._id.toString(),
        rating: review.rating,
        comment: review.comment,
      },
      averageRating,
      ratingCount,
    });
  } catch (error) {
    console.error("Error adding rating:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add rating",
    });
  }
});

/**
 * GET /api/ratings/:recipeId
 * Get ratings and reviews for a recipe
 */
router.get("/:recipeId", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { recipeId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: "Recipe not found",
      });
    }

    const reviews = await Review.find({ recipeId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ recipeId });

    // Check if user has rated this recipe
    let userReview = null;
    if (req.user) {
      userReview = await Review.findOne({
        recipeId,
        userId: req.user.id,
      });
    }

    res.json({
      success: true,
      averageRating: recipe.averageRating || 0,
      ratingCount: recipe.ratingCount || 0,
      userReview: userReview
        ? {
            rating: userReview.rating,
            comment: userReview.comment,
          }
        : null,
      reviews: reviews.map((r) => ({
        id: r._id.toString(),
        rating: r.rating,
        comment: r.comment,
        userName: (r.userId as any)?.name || (r.userId as any)?.email?.split("@")[0] || "Anonymous",
        createdAt: r.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch ratings",
    });
  }
});

/**
 * DELETE /api/ratings/:recipeId
 * Remove user's rating/review
 */
router.delete("/:recipeId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user!.id;

    await Review.findOneAndDelete({ recipeId, userId });

    // Recalculate average rating
    const reviews = await Review.find({ recipeId });
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    const ratingCount = reviews.length;

    // Update recipe
    await Recipe.findByIdAndUpdate(recipeId, {
      averageRating: Math.round(averageRating * 10) / 10,
      ratingCount,
    });

    res.json({
      success: true,
      message: "Rating removed",
    });
  } catch (error) {
    console.error("Error removing rating:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove rating",
    });
  }
});

export default router;


import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "./RatingStars";
import { useAuth } from "@/contexts/AuthContext";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { config } from "@/config";
import { AuthService } from "@/services/auth-service";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  userName: string;
  createdAt: string;
}

interface ReviewsSectionProps {
  recipeId: string;
  averageRating?: number;
  ratingCount?: number;
}

export function ReviewsSection({
  recipeId,
  averageRating = 0,
  ratingCount = 0,
}: ReviewsSectionProps) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userComment, setUserComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [recipeId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${config.api.url}/api/ratings/${recipeId}`,
        {
          headers: {
            ...AuthService.getAuthHeader(),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReviews(data.reviews || []);
          if (data.userReview) {
            setUserRating(data.userReview.rating);
            setUserComment(data.userReview.comment || "");
            setCurrentRating(data.userReview.rating);
          }
        }
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated || currentRating === 0) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `${config.api.url}/api/ratings/${recipeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...AuthService.getAuthHeader(),
          },
          body: JSON.stringify({
            rating: currentRating,
            comment: userComment || undefined,
          }),
        }
      );

      if (response.ok) {
        await loadReviews();
        setShowReviewForm(false);
        setUserComment("");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(
        `${config.api.url}/api/ratings/${recipeId}`,
        {
          method: "DELETE",
          headers: {
            ...AuthService.getAuthHeader(),
          },
        }
      );

      if (response.ok) {
        setUserRating(null);
        setUserComment("");
        setCurrentRating(0);
        await loadReviews();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Ratings & Reviews</h3>
          <div className="flex items-center gap-3">
            <RatingStars rating={averageRating} size="lg" />
            <span className="text-sm text-muted-foreground">
              {averageRating.toFixed(1)} ({ratingCount} {ratingCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>
        {isAuthenticated && !userRating && (
          <Button
            onClick={() => setShowReviewForm(!showReviewForm)}
            variant="outline"
            size="sm"
          >
            <Star className="mr-2 h-4 w-4" />
            Write a Review
          </Button>
        )}
      </div>

      {showReviewForm && isAuthenticated && !userRating && (
        <Card className="p-4 mb-6 bg-muted">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <RatingStars
                rating={currentRating}
                interactive
                onRatingChange={setCurrentRating}
                size="lg"
              />
            </div>
            <div>
              <label htmlFor="comment" className="text-sm font-medium mb-2 block">
                Comment (Optional)
              </label>
              <Textarea
                id="comment"
                placeholder="Share your thoughts about this recipe..."
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitReview}
                disabled={submitting || currentRating === 0}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewForm(false);
                  setCurrentRating(0);
                  setUserComment("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {userRating && (
        <Card className="p-4 mb-6 bg-accent-lighter">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <RatingStars rating={userRating} size="sm" />
                <span className="text-sm font-medium">Your Review</span>
              </div>
              {userComment && (
                <p className="text-sm text-muted-foreground">{userComment}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteReview}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RatingStars rating={review.rating} size="sm" />
                  <span className="text-sm font-medium">{review.userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground mt-2">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}


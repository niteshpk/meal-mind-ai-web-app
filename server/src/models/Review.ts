import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  recipeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number; // 1-5 stars
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one review per user per recipe
ReviewSchema.index({ recipeId: 1, userId: 1 }, { unique: true });
// Index for aggregating ratings
ReviewSchema.index({ recipeId: 1, rating: 1 });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);


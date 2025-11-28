import mongoose, { Schema, Document } from "mongoose";

export interface IMealPlan extends Document {
  userId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  meals: Array<{
    day: string; // "Monday", "Tuesday", etc.
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    recipeId: mongoose.Types.ObjectId;
    recipeName: string;
    notes?: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

const MealPlanSchema = new Schema<IMealPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
      index: true,
    },
    meals: [
      {
        day: {
          type: String,
          required: true,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        },
        mealType: {
          type: String,
          required: true,
          enum: ["breakfast", "lunch", "dinner", "snack"],
        },
        recipeId: {
          type: Schema.Types.ObjectId,
          ref: "Recipe",
          required: true,
        },
        recipeName: {
          type: String,
          required: true,
        },
        notes: {
          type: String,
          maxlength: 500,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure one meal plan per user per week
MealPlanSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });

export const MealPlan = mongoose.model<IMealPlan>("MealPlan", MealPlanSchema);


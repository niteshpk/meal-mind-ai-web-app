import mongoose, { Schema, Document } from "mongoose";

export interface ICustomRecipe extends Document {
  userId: mongoose.Types.ObjectId;
  originalRecipeId?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  cuisine: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  ingredients: Array<{
    amount: string;
    item: string;
  }>;
  instructions: string[];
  tips: string[];
  customNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomRecipeSchema = new Schema<ICustomRecipe>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cuisine: {
      type: String,
      required: true,
    },
    prepTime: {
      type: String,
      required: true,
    },
    cookTime: {
      type: String,
      required: true,
    },
    servings: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
    },
    ingredients: [
      {
        amount: { type: String, required: true },
        item: { type: String, required: true },
      },
    ],
    instructions: {
      type: [String],
      required: true,
      default: [],
    },
    tips: {
      type: [String],
      required: true,
      default: [],
    },
    originalRecipeId: {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
    },
    customNotes: {
      type: String,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

CustomRecipeSchema.index({ userId: 1, createdAt: -1 });

export const CustomRecipe = mongoose.model<ICustomRecipe>("CustomRecipe", CustomRecipeSchema);


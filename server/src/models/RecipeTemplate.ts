import mongoose, { Schema, Document } from "mongoose";

export interface IRecipeTemplate extends Document {
  cuisineId: string;
  name: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const RecipeTemplateSchema = new Schema<IRecipeTemplate>(
  {
    cuisineId: {
      type: String,
      required: true,
      unique: true,
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
  },
  {
    timestamps: true,
  }
);

export const RecipeTemplate = mongoose.model<IRecipeTemplate>(
  "RecipeTemplate",
  RecipeTemplateSchema
);


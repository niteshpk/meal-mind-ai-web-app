import mongoose, { Schema, Document } from "mongoose";

export interface ICuisineIngredient extends Document {
  cuisineId: string;
  ingredientIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const CuisineIngredientSchema = new Schema<ICuisineIngredient>(
  {
    cuisineId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ingredientIds: {
      type: [String],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const CuisineIngredient = mongoose.model<ICuisineIngredient>(
  "CuisineIngredient",
  CuisineIngredientSchema
);


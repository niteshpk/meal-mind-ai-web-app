import mongoose, { Schema, Document } from "mongoose";

export interface IIngredientMap extends Document {
  ingredientId: string;
  defaultAmount: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const IngredientMapSchema = new Schema<IIngredientMap>(
  {
    ingredientId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    defaultAmount: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const IngredientMap = mongoose.model<IIngredientMap>(
  "IngredientMap",
  IngredientMapSchema
);


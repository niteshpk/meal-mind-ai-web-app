import mongoose, { Schema, Document } from "mongoose";

export interface IIngredient extends Document {
  id: string;
  name: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const IngredientSchema = new Schema<IIngredient>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

IngredientSchema.set("toJSON", {
  transform: function (doc, ret) {
    const { __v, ...rest } = ret;
    return rest;
  },
});

export const Ingredient = mongoose.model<IIngredient>(
  "Ingredient",
  IngredientSchema
);


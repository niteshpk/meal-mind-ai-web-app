import mongoose, { Schema, Document } from "mongoose";

export interface ICuisine extends Document {
  id: string;
  name: string;
  description: string;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CuisineSchema = new Schema<ICuisine>(
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
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

CuisineSchema.set("toJSON", {
  transform: function (doc, ret) {
    const { __v, ...rest } = ret;
    return rest;
  },
});

export const Cuisine = mongoose.model<ICuisine>("Cuisine", CuisineSchema);


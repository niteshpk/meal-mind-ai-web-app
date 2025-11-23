import mongoose, { Schema, Document } from "mongoose";

export interface IDefaultInstructions extends Document {
  instructions: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDefaultTips extends Document {
  tips: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICuisineNames extends Document {
  cuisineId: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const DefaultInstructionsSchema = new Schema<IDefaultInstructions>(
  {
    instructions: {
      type: [String],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const DefaultTipsSchema = new Schema<IDefaultTips>(
  {
    tips: {
      type: [String],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const CuisineNamesSchema = new Schema<ICuisineNames>(
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
  },
  {
    timestamps: true,
  }
);

export const DefaultInstructions = mongoose.model<IDefaultInstructions>(
  "DefaultInstructions",
  DefaultInstructionsSchema
);

export const DefaultTips = mongoose.model<IDefaultTips>(
  "DefaultTips",
  DefaultTipsSchema
);

export const CuisineNames = mongoose.model<ICuisineNames>(
  "CuisineNames",
  CuisineNamesSchema
);


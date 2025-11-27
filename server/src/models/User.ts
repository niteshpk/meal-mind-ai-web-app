import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  favorites: mongoose.Types.ObjectId[]; // Array of recipe IDs
  recipeHistory: Array<{
    recipeId: mongoose.Types.ObjectId;
    viewedAt: Date;
  }>;
  preferences: {
    defaultDietaryRestrictions: string[];
    favoriteCuisines: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      trim: true,
    },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Recipe",
      },
    ],
    recipeHistory: [
      {
        recipeId: {
          type: Schema.Types.ObjectId,
          ref: "Recipe",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    preferences: {
      defaultDietaryRestrictions: {
        type: [String],
        default: [],
      },
      favoriteCuisines: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) {
    return;
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ "recipeHistory.viewedAt": -1 }); // For sorting history

export const User = mongoose.model<IUser>("User", UserSchema);


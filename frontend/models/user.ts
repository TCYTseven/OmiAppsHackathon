import { Schema, models } from "mongoose";
import mongoose from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    omiUid: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const User = models.User || mongoose.model("User", userSchema);
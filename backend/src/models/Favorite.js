import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true
  }
}, { timestamps: true });

// Índice único para evitar duplicados
favoriteSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);


import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema({
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
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  timestamp: {
    type: Number, // Tiempo en segundos del video
    required: true,
    min: 0
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ""
  },
  note: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ""
  }
}, { timestamps: true });

// Índice compuesto para búsquedas rápidas
bookmarkSchema.index({ user: 1, course: 1, lesson: 1 });

export default mongoose.model("Bookmark", bookmarkSchema);


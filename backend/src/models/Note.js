import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
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
    required: false, // Notas generales del curso no tienen lección
    index: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  timestamp: {
    type: Number, // Tiempo en segundos del video (si aplica)
    default: null
  }
}, { timestamps: true });

// Índices para búsquedas rápidas
noteSchema.index({ user: 1, course: 1 });
noteSchema.index({ user: 1, lesson: 1 });

export default mongoose.model("Note", noteSchema);


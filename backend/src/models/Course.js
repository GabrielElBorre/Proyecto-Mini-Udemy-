import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String },
  duration: { type: Number, default: 0 }, // en minutos
  order: { type: Number, required: true },
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0, default: 0 },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category", 
    required: false // Temporalmente no requerido para compatibilidad con cursos existentes
  },
  imageUrl: { type: String, default: "https://placehold.co/600x400" },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lessons: [lessonSchema],
  resources: [{ type: String }], // links, PDFs, videos adicionales
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

// Índices para mejorar búsquedas
courseSchema.index({ title: "text", description: "text" });
courseSchema.index({ category: 1 });
courseSchema.index({ instructor: 1 });

export default mongoose.model("Course", courseSchema);
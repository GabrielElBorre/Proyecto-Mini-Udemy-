import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 1000 },
}, { timestamps: true });

// Un estudiante solo puede dejar una reseña por curso
reviewSchema.index({ course: 1, student: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);



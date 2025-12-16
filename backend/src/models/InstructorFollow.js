import mongoose from "mongoose";

const instructorFollowSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  }
}, { timestamps: true });

// Índice único para evitar seguir dos veces
instructorFollowSchema.index({ follower: 1, instructor: 1 }, { unique: true });

export default mongoose.model("InstructorFollow", instructorFollowSchema);


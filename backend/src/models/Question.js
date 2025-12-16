import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  notHelpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, { timestamps: true });

const questionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // Preguntas generales del curso
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  answers: [answerSchema],
  isResolved: {
    type: Boolean,
    default: false
  },
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Índices
questionSchema.index({ course: 1, createdAt: -1 });
questionSchema.index({ lesson: 1, createdAt: -1 });
questionSchema.index({ user: 1 });

export default mongoose.model("Question", questionSchema);


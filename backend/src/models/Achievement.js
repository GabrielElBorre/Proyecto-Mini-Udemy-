import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      "first_course",           // Primer curso completado
      "course_master",          // 5 cursos completados
      "learning_champion",      // 10 cursos completados
      "lesson_explorer",        // 10 lecciones completadas
      "lesson_master",          // 50 lecciones completadas
      "reviewer",               // Primera reseña
      "active_reviewer",        // 5 reseñas
      "early_bird",             // Inscrito en primer curso
      "dedicated_learner",      // 7 días consecutivos de estudio
      "speed_learner",          // Completar curso en menos de 3 días
      "perfectionist",          // Todos los cursos con 5 estrellas
      "instructor",             // Crear primer curso
      "popular_instructor",     // Curso con 10+ estudiantes
      "top_instructor"          // Curso con 50+ estudiantes
    ]
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Índice compuesto para búsquedas rápidas
achievementSchema.index({ user: 1, type: 1 }, { unique: true });
achievementSchema.index({ user: 1, unlockedAt: -1 });

export default mongoose.model("Achievement", achievementSchema);


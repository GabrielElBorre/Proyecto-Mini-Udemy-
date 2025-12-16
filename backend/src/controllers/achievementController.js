import Achievement from "../models/Achievement.js";
import Enrollment from "../models/Enrollment.js";
import Review from "../models/Review.js";
import Course from "../models/Course.js";

// Obtener logros del usuario
export const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.id;

    const achievements = await Achievement.find({ user: userId })
      .sort({ unlockedAt: -1 });

    // Definir información de cada logro
    const achievementInfo = {
      first_course: {
        name: "Primer Paso",
        description: "Completa tu primer curso",
        icon: "🎯",
        color: "blue"
      },
      course_master: {
        name: "Maestro de Cursos",
        description: "Completa 5 cursos",
        icon: "🏆",
        color: "purple"
      },
      learning_champion: {
        name: "Campeón del Aprendizaje",
        description: "Completa 10 cursos",
        icon: "👑",
        color: "gold"
      },
      lesson_explorer: {
        name: "Explorador de Lecciones",
        description: "Completa 10 lecciones",
        icon: "🔍",
        color: "green"
      },
      lesson_master: {
        name: "Maestro de Lecciones",
        description: "Completa 50 lecciones",
        icon: "📚",
        color: "indigo"
      },
      reviewer: {
        name: "Crítico",
        description: "Deja tu primera reseña",
        icon: "⭐",
        color: "yellow"
      },
      active_reviewer: {
        name: "Crítico Activo",
        description: "Deja 5 reseñas",
        icon: "💬",
        color: "orange"
      },
      early_bird: {
        name: "Pionero",
        description: "Inscríbete en tu primer curso",
        icon: "🌅",
        color: "cyan"
      },
      dedicated_learner: {
        name: "Estudiante Dedicado",
        description: "Estudia 7 días consecutivos",
        icon: "🔥",
        color: "red"
      },
      speed_learner: {
        name: "Aprendiz Rápido",
        description: "Completa un curso en menos de 3 días",
        icon: "⚡",
        color: "yellow"
      },
      perfectionist: {
        name: "Perfeccionista",
        description: "Califica todos tus cursos con 5 estrellas",
        icon: "✨",
        color: "pink"
      },
      instructor: {
        name: "Instructor",
        description: "Crea tu primer curso",
        icon: "👨‍🏫",
        color: "blue"
      },
      popular_instructor: {
        name: "Instructor Popular",
        description: "Curso con 10+ estudiantes",
        icon: "🌟",
        color: "purple"
      },
      top_instructor: {
        name: "Top Instructor",
        description: "Curso con 50+ estudiantes",
        icon: "💎",
        color: "gold"
      }
    };

    // Enriquecer logros con información
    const enrichedAchievements = achievements.map(achievement => ({
      ...achievement.toObject(),
      info: achievementInfo[achievement.type] || {
        name: achievement.type,
        description: "Logro desbloqueado",
        icon: "🏅",
        color: "gray"
      }
    }));

    res.status(200).json({ achievements: enrichedAchievements });
  } catch (err) {
    console.error("Error al obtener logros:", err);
    res.status(500).json({ message: "Error al obtener logros", error: err.message });
  }
};

// Verificar y desbloquear logros
export const checkAndUnlockAchievements = async (userId, context = {}) => {
  try {
    const achievements = [];

    // Obtener datos del usuario
    const enrollments = await Enrollment.find({ student: userId })
      .populate("course", "lessons");
    
    const reviews = await Review.find({ student: userId });
    const courses = await Course.find({ instructor: userId });

    const completedCourses = enrollments.filter(e => e.progress === 100);
    const totalLessonsCompleted = enrollments.reduce((sum, e) => 
      sum + (e.completedLessons?.length || 0), 0
    );

    // 1. Primer curso completado
    if (completedCourses.length === 1 && context.action === "course_completed") {
      const exists = await Achievement.findOne({ user: userId, type: "first_course" });
      if (!exists) {
        const achievement = await Achievement.create({
          user: userId,
          type: "first_course",
          progress: 100
        });
        achievements.push(achievement);
      }
    }

    // 2. Maestro de Cursos (5 cursos)
    if (completedCourses.length >= 5) {
      const exists = await Achievement.findOne({ user: userId, type: "course_master" });
      if (!exists) {
        const achievement = await Achievement.create({
          user: userId,
          type: "course_master",
          progress: 100
        });
        achievements.push(achievement);
      }
    }

    // 3. Campeón del Aprendizaje (10 cursos)
    if (completedCourses.length >= 10) {
      const exists = await Achievement.findOne({ user: userId, type: "learning_champion" });
      if (!exists) {
        const achievement = await Achievement.create({
          user: userId,
          type: "learning_champion",
          progress: 100
        });
        achievements.push(achievement);
      }
    }

    // 4. Explorador de Lecciones (10 lecciones)
    if (totalLessonsCompleted >= 10) {
      const exists = await Achievement.findOne({ user: userId, type: "lesson_explorer" });
      if (!exists) {
        const achievement = await Achievement.create({
          user: userId,
          type: "lesson_explorer",
          progress: 100
        });
        achievements.push(achievement);
      }
    }

    // 5. Maestro de Lecciones (50 lecciones)
    if (totalLessonsCompleted >= 50) {
      const exists = await Achievement.findOne({ user: userId, type: "lesson_master" });
      if (!exists) {
        const achievement = await Achievement.create({
          user: userId,
          type: "lesson_master",
          progress: 100
        });
        achievements.push(achievement);
      }
    }

    // 6. Crítico (primera reseña)
    if (reviews.length === 1 && context.action === "review_created") {
      const exists = await Achievement.findOne({ user: userId, type: "reviewer" });
      if (!exists) {
        const achievement = await Achievement.create({
          user: userId,
          type: "reviewer",
          progress: 100
        });
        achievements.push(achievement);
      }
    }

    // 7. Crítico Activo (5 reseñas)
    if (reviews.length >= 5) {
      const exists = await Achievement.findOne({ user: userId, type: "active_reviewer" });
      if (!exists) {
        const achievement = await Achievement.create({
          user: userId,
          type: "active_reviewer",
          progress: 100
        });
        achievements.push(achievement);
      }
    }

    // 8. Pionero (primer curso inscrito)
    if (enrollments.length === 1 && context.action === "course_enrolled") {
      const exists = await Achievement.findOne({ user: userId, type: "early_bird" });
      if (!exists) {
        const achievement = await Achievement.create({
          user: userId,
          type: "early_bird",
          progress: 100
        });
        achievements.push(achievement);
      }
    }

    // 9. Instructor (crear primer curso)
    if (courses.length === 1 && context.action === "course_created") {
      const exists = await Achievement.findOne({ user: userId, type: "instructor" });
      if (!exists) {
        const achievement = await Achievement.create({
          user: userId,
          type: "instructor",
          progress: 100
        });
        achievements.push(achievement);
      }
    }

    // 10. Instructor Popular (curso con 10+ estudiantes)
    for (const course of courses) {
      const studentCount = course.students?.length || 0;
      if (studentCount >= 10 && studentCount < 50) {
        const exists = await Achievement.findOne({ 
          user: userId, 
          type: "popular_instructor",
          "metadata.courseId": course._id
        });
        if (!exists) {
          const achievement = await Achievement.create({
            user: userId,
            type: "popular_instructor",
            progress: 100,
            metadata: { courseId: course._id }
          });
          achievements.push(achievement);
        }
      }
    }

    // 11. Top Instructor (curso con 50+ estudiantes)
    for (const course of courses) {
      const studentCount = course.students?.length || 0;
      if (studentCount >= 50) {
        const exists = await Achievement.findOne({ 
          user: userId, 
          type: "top_instructor",
          "metadata.courseId": course._id
        });
        if (!exists) {
          const achievement = await Achievement.create({
            user: userId,
            type: "top_instructor",
            progress: 100,
            metadata: { courseId: course._id }
          });
          achievements.push(achievement);
        }
      }
    }

    return achievements;
  } catch (err) {
    console.error("Error al verificar logros:", err);
    return [];
  }
};

// Obtener progreso hacia logros no desbloqueados
export const getAchievementProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.find({ student: userId })
      .populate("course", "lessons");
    const reviews = await Review.find({ student: userId });
    const courses = await Course.find({ instructor: userId });

    const completedCourses = enrollments.filter(e => e.progress === 100);
    const totalLessonsCompleted = enrollments.reduce((sum, e) => 
      sum + (e.completedLessons?.length || 0), 0
    );

    const progress = [
      {
        type: "course_master",
        name: "Maestro de Cursos",
        description: "Completa 5 cursos",
        icon: "🏆",
        current: completedCourses.length,
        target: 5,
        progress: Math.min(100, (completedCourses.length / 5) * 100)
      },
      {
        type: "learning_champion",
        name: "Campeón del Aprendizaje",
        description: "Completa 10 cursos",
        icon: "👑",
        current: completedCourses.length,
        target: 10,
        progress: Math.min(100, (completedCourses.length / 10) * 100)
      },
      {
        type: "lesson_master",
        name: "Maestro de Lecciones",
        description: "Completa 50 lecciones",
        icon: "📚",
        current: totalLessonsCompleted,
        target: 50,
        progress: Math.min(100, (totalLessonsCompleted / 50) * 100)
      },
      {
        type: "active_reviewer",
        name: "Crítico Activo",
        description: "Deja 5 reseñas",
        icon: "💬",
        current: reviews.length,
        target: 5,
        progress: Math.min(100, (reviews.length / 5) * 100)
      }
    ];

    // Filtrar solo los que no están completados
    const unlockedAchievements = await Achievement.find({ user: userId });
    const unlockedTypes = unlockedAchievements.map(a => a.type);
    
    const filteredProgress = progress.filter(p => !unlockedTypes.includes(p.type));

    res.status(200).json({ progress: filteredProgress });
  } catch (err) {
    console.error("Error al obtener progreso de logros:", err);
    res.status(500).json({ message: "Error al obtener progreso", error: err.message });
  }
};


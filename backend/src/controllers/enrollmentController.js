import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import { checkAndUnlockAchievements } from "./achievementController.js";

// Inscribirse a un curso
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id;

    if (req.user.role === "instructor") {
      return res.status(403).json({ message: "Los instructores no pueden inscribirse a cursos" });
    }

    // Verificar que el curso existe
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    // Verificar si ya está inscrito
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: "Ya estás inscrito en este curso" });
    }

    // Crear inscripción
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      progress: 0,
      completedLessons: [],
    });

    console.log(`✅ [Enrollment] Inscripción creada:`, {
      enrollmentId: enrollment._id,
      studentId: studentId,
      courseId: courseId,
      progress: enrollment.progress
    });

    // Agregar estudiante al curso
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { students: studentId } },
      { new: true }
    );

    console.log(`✅ [Enrollment] Estudiante agregado al curso. Total estudiantes:`, updatedCourse.students?.length || 0);

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate("course", "title description imageUrl lessons")
      .populate("student", "name email");

    console.log(`✅ [Enrollment] Inscripción completada exitosamente para curso:`, populatedEnrollment.course?.title);

    // Verificar logros (pionero)
    await checkAndUnlockAchievements(studentId, { action: "course_enrolled" });

    res.status(201).json({ 
      message: "Inscripción exitosa", 
      enrollment: populatedEnrollment 
    });
  } catch (err) {
    console.error("Error al inscribirse:", err);
    res.status(500).json({ message: "Error al inscribirse", error: err.message });
  }
};

// Obtener cursos inscritos del estudiante
export const getStudentCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.find({ student: studentId })
      .populate({
        path: "course",
        populate: { path: "instructor", select: "name email photoUrl" },
      })
      .sort({ enrolledAt: -1 });

    res.status(200).json(enrollments);
  } catch (err) {
    console.error("Error al obtener cursos del estudiante:", err);
    res.status(500).json({ message: "Error al obtener cursos", error: err.message });
  }
};

// Obtener estadísticas del estudiante
export const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.find({ student: studentId })
      .populate("course", "title lessons");

    const totalCourses = enrollments.length;
    const totalLessons = enrollments.reduce((sum, e) => sum + (e.course.lessons?.length || 0), 0);
    const completedLessons = enrollments.reduce((sum, e) => sum + (e.completedLessons?.length || 0), 0);
    const completedCourses = enrollments.filter(e => e.progress === 100).length;
    const averageProgress = totalCourses > 0 
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses)
      : 0;
    
    // Calcular tiempo total de estudio (estimado)
    const totalStudyTime = enrollments.reduce((sum, e) => {
      const courseLessons = e.course.lessons || [];
      const completedCourseLessons = courseLessons.filter(lesson => 
        e.completedLessons.some(id => id.toString() === lesson._id?.toString())
      );
      return sum + completedCourseLessons.reduce((lessonSum, lesson) => 
        lessonSum + (lesson.duration || 0), 0
      );
    }, 0);

    res.status(200).json({
      totalCourses,
      totalLessons,
      completedLessons,
      completedCourses,
      averageProgress,
      totalStudyTime, // en minutos
      enrollments: enrollments.length
    });
  } catch (err) {
    console.error("Error al obtener estadísticas:", err);
    res.status(500).json({ message: "Error al obtener estadísticas", error: err.message });
  }
};

// Actualizar progreso de una lección
export const updateProgress = async (req, res) => {
  try {
    const { enrollmentId, lessonId } = req.body;
    const studentId = req.user.id;

    if (!enrollmentId || !lessonId) {
      return res.status(400).json({ message: "enrollmentId y lessonId son requeridos" });
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ message: "Inscripción no encontrada" });
    }

    if (enrollment.student.toString() !== studentId) {
      return res.status(403).json({ message: "No tienes permiso para actualizar este progreso" });
    }

    // Convertir lessonId a ObjectId si es string
    const lessonObjectId = typeof lessonId === 'string' ? lessonId : lessonId.toString();
    
    // Verificar si la lección ya está completada
    const isAlreadyCompleted = enrollment.completedLessons.some(
      id => id.toString() === lessonObjectId
    );

    if (!isAlreadyCompleted) {
      // Agregar lección completada
      enrollment.completedLessons.push(lessonObjectId);
      console.log(`✅ [Progress] Lección ${lessonObjectId} marcada como completada`);
    } else {
      console.log(`ℹ️ [Progress] Lección ${lessonObjectId} ya estaba completada`);
    }

    // Calcular progreso
    const course = await Course.findById(enrollment.course);
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    // Validar que la lección pertenezca al curso
    const lessonExists = course.lessons?.some(
      lesson => lesson._id.toString() === lessonObjectId
    );
    
    if (!lessonExists) {
      return res.status(400).json({ 
        message: "La lección no pertenece a este curso" 
      });
    }

    const totalLessons = course.lessons?.length || 0;
    const completedCount = enrollment.completedLessons.length;
    const previousProgress = enrollment.progress;
    enrollment.progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Si completó el 100%, marcar fecha de completado
    if (enrollment.progress === 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
      console.log(`🎉 [Progress] Curso completado al 100%!`);
      
      // Verificar logros (primer curso, maestro de cursos, etc.)
      await checkAndUnlockAchievements(studentId, { action: "course_completed" });
    }

    await enrollment.save();

    console.log(`✅ [Progress] Progreso actualizado:`, {
      enrollmentId: enrollment._id,
      courseId: enrollment.course,
      previousProgress: previousProgress,
      newProgress: enrollment.progress,
      completedLessons: completedCount,
      totalLessons: totalLessons
    });

    // Populate para devolver datos completos
    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate("course", "title description imageUrl lessons")
      .populate("student", "name email");

    res.status(200).json({ 
      message: "Progreso actualizado exitosamente", 
      enrollment: populatedEnrollment 
    });
  } catch (err) {
    console.error("❌ [Progress] Error al actualizar progreso:", err);
    res.status(500).json({ message: "Error al actualizar progreso", error: err.message });
  }
};



import Review from "../models/Review.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { checkAndUnlockAchievements } from "./achievementController.js";

// Crear o actualizar reseña
export const createOrUpdateReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const studentId = req.user.id;

    // Validar que el estudiante esté inscrito
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(403).json({ 
        message: "Debes estar inscrito en el curso para dejar una reseña" 
      });
    }

    // Validar rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "El rating debe estar entre 1 y 5" });
    }

    // Buscar reseña existente o crear nueva
    let review = await Review.findOne({ course: courseId, student: studentId });

    if (review) {
      // Actualizar reseña existente
      review.rating = rating;
      review.comment = comment || "";
      await review.save();
    } else {
      // Crear nueva reseña
      review = await Review.create({
        course: courseId,
        student: studentId,
        rating,
        comment: comment || "",
      });
    }

    // Actualizar rating promedio del curso
    await updateCourseRating(courseId);

    // Verificar logros (crítico, crítico activo) - solo si es una nueva reseña
    const isNewReview = !review || (review.createdAt && review.updatedAt && 
      new Date(review.createdAt).getTime() === new Date(review.updatedAt).getTime());
    
    if (isNewReview) {
      await checkAndUnlockAchievements(studentId, { action: "review_created" });
    } else {
      // Si es actualización, verificar logros de todas formas (por si acaso)
      await checkAndUnlockAchievements(studentId, { action: "review_updated" });
    }

    const populatedReview = await Review.findById(review._id)
      .populate("student", "name email photoUrl");

    res.status(201).json({ 
      message: review.updatedAt > review.createdAt ? "Reseña actualizada" : "Reseña creada",
      review: populatedReview 
    });
  } catch (err) {
    console.error("Error al crear/actualizar reseña:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Ya has dejado una reseña para este curso" });
    }
    res.status(500).json({ message: "Error al guardar reseña", error: err.message });
  }
};

// Obtener reseñas de un curso
export const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const reviews = await Review.find({ course: courseId })
      .populate("student", "name email photoUrl")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error al obtener reseñas:", err);
    res.status(500).json({ message: "Error al obtener reseñas", error: err.message });
  }
};

// Obtener reseña del usuario actual para un curso
export const getMyReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const review = await Review.findOne({ course: courseId, student: studentId })
      .populate("student", "name email photoUrl");

    res.status(200).json(review || null);
  } catch (err) {
    console.error("Error al obtener reseña:", err);
    res.status(500).json({ message: "Error al obtener reseña", error: err.message });
  }
};

// Eliminar reseña
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const studentId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    if (review.student.toString() !== studentId) {
      return res.status(403).json({ message: "No tienes permiso para eliminar esta reseña" });
    }

    const courseId = review.course;
    await Review.findByIdAndDelete(reviewId);

    // Actualizar rating del curso
    await updateCourseRating(courseId);

    res.status(200).json({ message: "Reseña eliminada" });
  } catch (err) {
    console.error("Error al eliminar reseña:", err);
    res.status(500).json({ message: "Error al eliminar reseña", error: err.message });
  }
};

// Función auxiliar para actualizar el rating del curso
async function updateCourseRating(courseId) {
  const reviews = await Review.find({ course: courseId });
  
  if (reviews.length === 0) {
    await Course.findByIdAndUpdate(courseId, {
      rating: 0,
      ratingCount: 0,
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await Course.findByIdAndUpdate(courseId, {
    rating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
    ratingCount: reviews.length,
  });
}



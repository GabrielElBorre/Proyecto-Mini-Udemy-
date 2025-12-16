import Course from "../models/Course.js";
import Category from "../models/Category.js";
import Enrollment from "../models/Enrollment.js";
import Review from "../models/Review.js";
import { checkAndUnlockAchievements } from "./achievementController.js";

// Crear curso (cualquier usuario autenticado)
export const createCourse = async (req, res) => {
  try {
    const { title, description, price, category, imageUrl, lessons, resources } = req.body;
    const instructorId = req.user.id; // Cualquier usuario autenticado puede ser instructor

    // Validaciones básicas
    if (!title || !description || price === undefined) {
      return res.status(400).json({ message: "Título, descripción y precio son requeridos" });
    }

    if (price < 0) {
      return res.status(400).json({ message: "El precio no puede ser negativo" });
    }

    // Si category viene como string (nombre), buscar el ObjectId
    let categoryId = category;
    if (typeof category === 'string' && !category.match(/^[0-9a-fA-F]{24}$/)) {
      // Es un nombre de categoría, buscar el ObjectId
      const foundCategory = await Category.findOne({ name: category });
      if (!foundCategory) {
        // Si no existe, usar "Otros" por defecto
        const defaultCategory = await Category.findOne({ name: "Otros" });
        categoryId = defaultCategory?._id;
      } else {
        categoryId = foundCategory._id;
      }
    }

    const newCourse = await Course.create({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category: categoryId,
      imageUrl: imageUrl || "https://placehold.co/600x400",
      instructor: instructorId,
      lessons: lessons || [],
      resources: resources || [],
      isPublished: true, // Publicar automáticamente los cursos nuevos
    });

    const populatedCourse = await Course.findById(newCourse._id)
      .populate("instructor", "name email")
      .populate("category", "name icon color");

    // Verificar logros (instructor)
    await checkAndUnlockAchievements(instructorId, { action: "course_created" });

    res.status(201).json({ message: "Curso creado", course: populatedCourse });
  } catch (err) {
    console.error("Error al crear curso:", err);
    res.status(500).json({ message: "Error al crear curso", error: err.message });
  }
};

// Listar cursos (con filtros opcionales)
export const getCourses = async (req, res) => {
  try {
    const { category, search, instructor } = req.query;
    const query = {};

    if (category && category !== "Todos") {
      // Si category viene como nombre, buscar el ObjectId
      if (typeof category === 'string' && !category.match(/^[0-9a-fA-F]{24}$/)) {
        const foundCategory = await Category.findOne({ name: category });
        if (foundCategory) {
          query.category = foundCategory._id;
        }
      } else {
        query.category = category;
      }
    }

    if (instructor) {
      query.instructor = instructor;
    }

    // Solo mostrar cursos publicados o del instructor actual
    if (req.user && req.user.role === "instructor") {
      // Los instructores ven sus propios cursos aunque no estén publicados
      if (instructor === req.user.id) {
        // Ya está filtrado por instructor
      } else {
        query.isPublished = true;
      }
    } else {
      query.isPublished = true;
    }

    let courses = await Course.find(query)
      .populate("instructor", "name email photoUrl")
      .populate("category", "name icon color description")
      .sort({ createdAt: -1 });

    // Búsqueda por texto (si se proporciona)
    if (search) {
      const searchRegex = new RegExp(search, "i"); // Case insensitive
      courses = courses.filter(course => {
        const categoryName = course.category?.name || course.category || "";
        return (
          course.title.match(searchRegex) || 
          course.description.match(searchRegex) ||
          categoryName.match(searchRegex)
        );
      });
    }

    res.status(200).json(courses);
  } catch (err) {
    console.error("Error al obtener cursos:", err);
    res.status(500).json({ message: "Error al obtener cursos", error: err.message });
  }
};

// Obtener curso por ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id)
      .populate("instructor", "name email photoUrl")
      .populate("category", "name icon color description")
      .populate("students", "name email");

    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    // Verificar si el usuario está inscrito
    let enrollment = null;
    if (req.user) {
      enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: id,
      }).populate("student", "name email");
      
      console.log(`🔍 [CourseDetail] Enrollment encontrado para usuario ${req.user.id}:`, enrollment ? "Sí" : "No");
      if (enrollment) {
        console.log(`📊 [CourseDetail] Progreso: ${enrollment.progress}%, Lecciones completadas: ${enrollment.completedLessons?.length || 0}`);
      }
    }

    res.status(200).json({ course, enrollment });
  } catch (err) {
    console.error("Error al obtener curso:", err);
    res.status(500).json({ message: "Error al obtener curso", error: err.message });
  }
};

// Obtener cursos del usuario (cualquier usuario autenticado puede ver sus cursos)
export const getInstructorCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const courses = await Course.find({ instructor: userId })
      .populate("instructor", "name email photoUrl")
      .populate("category", "name icon color description")
      .sort({ createdAt: -1 });

    // Agregar número de estudiantes inscritos
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
        return {
          ...course.toObject(),
          enrollmentCount,
        };
      })
    );

    res.status(200).json(coursesWithStats);
  } catch (err) {
    console.error("Error al obtener cursos del instructor:", err);
    res.status(500).json({ message: "Error al obtener cursos", error: err.message });
  }
};

// Obtener estudiantes inscritos en un curso con su progreso y reseñas
export const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Verificar que el curso existe y pertenece al instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    if (course.instructor.toString() !== userId) {
      return res.status(403).json({ message: "No tienes permiso para ver los estudiantes de este curso" });
    }

    // Obtener todas las inscripciones del curso
    const enrollments = await Enrollment.find({ course: courseId })
      .populate("student", "name email photoUrl")
      .sort({ enrolledAt: -1 });

    // Obtener reseñas de los estudiantes
    const reviews = await Review.find({ course: courseId })
      .populate("student", "name email photoUrl");

    // Crear un mapa de reseñas por estudiante
    const reviewsMap = {};
    reviews.forEach(review => {
      reviewsMap[review.student._id.toString()] = review;
    });

    // Combinar información de inscripciones con reseñas
    const studentsData = enrollments.map(enrollment => {
      const studentId = enrollment.student._id.toString();
      const review = reviewsMap[studentId] || null;
      const totalLessons = course.lessons?.length || 0;
      const completedLessons = enrollment.completedLessons?.length || 0;
      const isCompleted = enrollment.progress === 100;

      return {
        enrollmentId: enrollment._id,
        student: {
          _id: enrollment.student._id,
          name: enrollment.student.name,
          email: enrollment.student.email,
          photoUrl: enrollment.student.photoUrl,
        },
        progress: enrollment.progress,
        completedLessons,
        totalLessons,
        isCompleted,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        review: review ? {
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        } : null,
      };
    });

    const totalStudents = studentsData.length;
    
    // Verificar logros del instructor (popular_instructor, top_instructor)
    if (totalStudents >= 10) {
      await checkAndUnlockAchievements(course.instructor.toString(), { 
        action: "students_updated",
        courseId: course._id 
      });
    }

    res.status(200).json({
      course: {
        _id: course._id,
        title: course.title,
        totalLessons: course.lessons?.length || 0,
      },
      students: studentsData,
      totalStudents: totalStudents,
      completedStudents: studentsData.filter(s => s.isCompleted).length,
    });
  } catch (err) {
    console.error("Error al obtener estudiantes del curso:", err);
    res.status(500).json({ message: "Error al obtener estudiantes", error: err.message });
  }
};

// Actualizar curso
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que el curso pertenece al usuario
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    if (course.instructor.toString() !== userId) {
      return res.status(403).json({ message: "No tienes permiso para editar este curso" });
    }

    const { title, description, price, category, imageUrl, lessons, resources, isPublished } = req.body;

    // Si category viene como string (nombre), buscar el ObjectId
    let categoryId = category;
    if (category && typeof category === 'string' && !category.match(/^[0-9a-fA-F]{24}$/)) {
      const foundCategory = await Category.findOne({ name: category });
      if (foundCategory) {
        categoryId = foundCategory._id;
      } else {
        categoryId = course.category; // Mantener la categoría actual si no se encuentra
      }
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        title: title?.trim(),
        description: description?.trim(),
        price: price !== undefined ? Number(price) : course.price,
        category: categoryId || course.category,
        imageUrl: imageUrl || course.imageUrl,
        lessons: lessons || course.lessons,
        resources: resources || course.resources,
        isPublished: isPublished !== undefined ? isPublished : course.isPublished,
      },
      { new: true, runValidators: true }
    )
      .populate("instructor", "name email")
      .populate("category", "name icon color description");

    res.status(200).json({ message: "Curso actualizado", course: updatedCourse });
  } catch (err) {
    console.error("Error al actualizar curso:", err);
    res.status(500).json({ message: "Error al actualizar curso", error: err.message });
  }
};

// Eliminar curso
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que el curso pertenece al usuario
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    if (course.instructor.toString() !== userId) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este curso" });
    }

    // Eliminar también las inscripciones y reseñas relacionadas
    await Enrollment.deleteMany({ course: id });
    await Review.deleteMany({ course: id });

    await Course.findByIdAndDelete(id);

    res.status(200).json({ message: "Curso eliminado" });
  } catch (err) {
    console.error("Error al eliminar curso:", err);
    res.status(500).json({ message: "Error al eliminar curso", error: err.message });
  }
};

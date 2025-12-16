import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Review from "../models/Review.js";
import bcrypt from "bcryptjs";

dotenv.config();

/**
 * Script completo para relacionar todos los datos en la base de datos:
 * - Usuarios (estudiantes e instructores)
 * - Cursos con lecciones
 * - Inscripciones (estudiantes en cursos)
 * - Reseñas (estudiantes sobre cursos)
 * - Progreso de lecciones (lecciones completadas)
 * - Actualización de estadísticas de cursos
 */

async function relateAllData() {
  try {
    console.log("🚀 Iniciando relación de datos...\n");
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB\n");

    // ============================================
    // 1. VERIFICAR/CREAR USUARIOS
    // ============================================
    console.log("📋 Paso 1: Verificando usuarios...");
    
    // Obtener o crear instructores
    let instructors = await User.find({ role: "instructor" });
    if (instructors.length === 0) {
      console.log("   ⚠️  No hay instructores. Creando instructores por defecto...");
      const hashedPassword = await bcrypt.hash("password123", 10);
      
      instructors = await User.insertMany([
        {
          name: "Prof. Juan Pérez",
          email: "juan.perez@instructor.com",
          password: hashedPassword,
          role: "instructor",
          photoUrl: "https://i.pravatar.cc/150?img=12"
        },
        {
          name: "Prof. María García",
          email: "maria.garcia@instructor.com",
          password: hashedPassword,
          role: "instructor",
          photoUrl: "https://i.pravatar.cc/150?img=13"
        },
        {
          name: "Prof. Carlos López",
          email: "carlos.lopez@instructor.com",
          password: hashedPassword,
          role: "instructor",
          photoUrl: "https://i.pravatar.cc/150?img=14"
        }
      ]);
      console.log(`   ✅ ${instructors.length} instructores creados`);
    } else {
      console.log(`   ✅ ${instructors.length} instructores encontrados`);
    }

    // Obtener o crear estudiantes
    let students = await User.find({ role: "student" });
    if (students.length < 20) {
      console.log(`   ⚠️  Solo hay ${students.length} estudiantes. Creando más estudiantes...`);
      const hashedPassword = await bcrypt.hash("password123", 10);
      
      const newStudents = [];
      const studentNames = [
        "Ana Martínez", "Luis Hernández", "Sofía López", "Diego Pérez",
        "Valentina Sánchez", "Andrés Ramírez", "Isabella Torres", "Sebastián Flores",
        "Camila Díaz", "Mateo Cruz", "Lucía Morales", "Nicolás Vega",
        "Emma Jiménez", "Daniel Castro", "Olivia Ruiz", "Gabriel Mendoza",
        "Mía Herrera", "Samuel Ortega", "Luna Vargas", "Maximiliano Ríos"
      ];

      for (let i = 0; i < 20; i++) {
        const email = `estudiante${i + 1}@example.com`;
        const existing = await User.findOne({ email });
        if (!existing) {
          newStudents.push({
            name: studentNames[i] || `Estudiante ${i + 1}`,
            email,
            password: hashedPassword,
            role: "student",
            photoUrl: `https://i.pravatar.cc/150?img=${i + 1}`
          });
        }
      }

      if (newStudents.length > 0) {
        const created = await User.insertMany(newStudents);
        students = await User.find({ role: "student" });
        console.log(`   ✅ ${created.length} nuevos estudiantes creados`);
      }
    }
    console.log(`   ✅ Total: ${students.length} estudiantes\n`);

    // ============================================
    // 2. VERIFICAR CURSOS
    // ============================================
    console.log("📚 Paso 2: Verificando cursos...");
    let courses = await Course.find({}).populate("instructor");
    
    if (courses.length === 0) {
      console.log("   ⚠️  No hay cursos. Creando cursos de ejemplo...");
      
      // Asignar cursos a instructores
      const coursesData = [];
      for (let i = 0; i < 20; i++) {
        const instructor = instructors[i % instructors.length];
        coursesData.push({
          title: `Curso de Ejemplo ${i + 1}`,
          description: `Descripción detallada del curso ${i + 1}. Este curso cubre temas importantes y prácticos.`,
          price: Math.floor(Math.random() * 500) + 99,
          category: ["Desarrollo", "Diseño", "Negocios", "Marketing", "Otros"][i % 5],
          instructor: instructor._id,
          imageUrl: `https://source.unsplash.com/600x400/?education,technology,${i % 2 === 0 ? 'coding' : 'design'}`,
          lessons: [
            { title: `Lección 1 del Curso ${i + 1}`, description: "Introducción", videoUrl: "https://youtube.com/watch?v=example1", duration: 20, order: 1 },
            { title: `Lección 2 del Curso ${i + 1}`, description: "Conceptos básicos", videoUrl: "https://youtube.com/watch?v=example2", duration: 25, order: 2 },
            { title: `Lección 3 del Curso ${i + 1}`, description: "Práctica", videoUrl: "https://youtube.com/watch?v=example3", duration: 30, order: 3 },
            { title: `Lección 4 del Curso ${i + 1}`, description: "Proyecto final", videoUrl: "https://youtube.com/watch?v=example4", duration: 40, order: 4 }
          ],
          isPublished: true,
          rating: 0,
          ratingCount: 0
        });
      }
      
      courses = await Course.insertMany(coursesData);
      console.log(`   ✅ ${courses.length} cursos creados`);
    } else {
      console.log(`   ✅ ${courses.length} cursos encontrados`);
    }
    console.log(`   📊 Cursos con lecciones: ${courses.filter(c => c.lessons && c.lessons.length > 0).length}\n`);

    // ============================================
    // 3. CREAR INSCRIPCIONES (ENROLLMENTS)
    // ============================================
    console.log("📝 Paso 3: Creando inscripciones...");
    
    // Limpiar inscripciones existentes (opcional, comentar si quieres mantener las existentes)
    // await Enrollment.deleteMany({});
    
    let totalEnrollments = 0;
    const enrollmentPromises = [];

    for (const student of students) {
      // Cada estudiante se inscribe en 3-8 cursos aleatorios
      const numEnrollments = Math.floor(Math.random() * 6) + 3;
      const randomCourses = courses
        .sort(() => Math.random() - 0.5)
        .slice(0, numEnrollments);

      for (const course of randomCourses) {
        // Verificar si ya existe la inscripción
        const existing = await Enrollment.findOne({
          student: student._id,
          course: course._id
        });

        if (!existing) {
          // Calcular progreso aleatorio (0-100%)
          const progress = Math.floor(Math.random() * 100);
          
          // Determinar lecciones completadas basado en el progreso
          const totalLessons = course.lessons?.length || 0;
          const completedLessonsCount = Math.floor((progress / 100) * totalLessons);
          // Las lecciones son subdocumentos, así que usamos su _id
          const completedLessons = course.lessons && course.lessons.length > 0
            ? course.lessons
                .slice(0, completedLessonsCount)
                .map(lesson => {
                  // Si la lección tiene _id (ya guardada), usarlo; si no, será null y se ignorará
                  return lesson._id || null;
                })
                .filter(id => id !== null && id !== undefined)
            : [];

          // Fecha de inscripción (últimos 30 días)
          const enrolledAt = new Date();
          enrolledAt.setDate(enrolledAt.getDate() - Math.floor(Math.random() * 30));

          // Si está completo, agregar fecha de finalización
          let completedAt = null;
          if (progress === 100) {
            completedAt = new Date(enrolledAt);
            completedAt.setDate(completedAt.getDate() + Math.floor(Math.random() * 20) + 5);
          }

          enrollmentPromises.push(
            Enrollment.create({
              student: student._id,
              course: course._id,
              progress,
              completedLessons,
              enrolledAt,
              completedAt
            })
          );
        }
      }
    }

    // Ejecutar todas las inscripciones
    if (enrollmentPromises.length > 0) {
      const createdEnrollments = await Promise.all(enrollmentPromises);
      totalEnrollments = createdEnrollments.length;
      console.log(`   ✅ ${totalEnrollments} nuevas inscripciones creadas`);
    } else {
      const existingEnrollments = await Enrollment.countDocuments();
      totalEnrollments = existingEnrollments;
      console.log(`   ✅ ${totalEnrollments} inscripciones ya existentes`);
    }

    // Actualizar array de estudiantes en cada curso
    console.log("   🔄 Actualizando lista de estudiantes en cursos...");
    for (const course of courses) {
      const enrollments = await Enrollment.find({ course: course._id });
      const studentIds = enrollments.map(e => e.student);
      await Course.findByIdAndUpdate(course._id, {
        $set: { students: studentIds }
      });
    }
    console.log(`   ✅ Listas de estudiantes actualizadas\n`);

    // ============================================
    // 4. CREAR RESEÑAS (REVIEWS)
    // ============================================
    console.log("⭐ Paso 4: Creando reseñas...");
    
    // Limpiar reseñas existentes (opcional)
    // await Review.deleteMany({});
    
    const reviewComments = [
      "Excelente curso, muy completo y bien explicado. Lo recomiendo totalmente.",
      "Buen contenido, aunque algunos temas podrían estar mejor explicados.",
      "Me encantó. Aprendí mucho y pude aplicar los conocimientos inmediatamente.",
      "Curso completo y profesional. Aprendí todo lo que necesitaba.",
      "Muy bueno, pero esperaba más ejemplos prácticos.",
      "Excelente instructor y contenido de calidad. Vale la pena.",
      "Buen curso para principiantes. Muy claro y fácil de seguir.",
      "Contenido actualizado y relevante. Muy satisfecho.",
      "El mejor curso que he tomado. Superó mis expectativas.",
      "Buen curso, aunque el ritmo es un poco rápido.",
      "Excelente material y explicaciones claras.",
      "Muy recomendado. Aprendí mucho en poco tiempo.",
      "Curso bien estructurado y fácil de entender.",
      "Buen contenido, pero falta más práctica.",
      "Excelente curso. El instructor es muy bueno explicando."
    ];

    let totalReviews = 0;
    const reviewPromises = [];

    // Para cada estudiante, crear reseñas en algunos de sus cursos inscritos
    for (const student of students) {
      const enrollments = await Enrollment.find({ student: student._id });
      
      // Crear reseñas en el 40-60% de los cursos inscritos
      const numReviews = Math.floor(enrollments.length * (0.4 + Math.random() * 0.2));
      const coursesToReview = enrollments
        .sort(() => Math.random() - 0.5)
        .slice(0, numReviews);

      for (const enrollment of coursesToReview) {
        // Verificar si ya existe una reseña
        const existing = await Review.findOne({
          student: student._id,
          course: enrollment.course
        });

        if (!existing) {
          const rating = Math.floor(Math.random() * 2) + 4; // 4 o 5 estrellas (mayormente positivas)
          const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];

          reviewPromises.push(
            Review.create({
              student: student._id,
              course: enrollment.course,
              rating,
              comment
            })
          );
        }
      }
    }

    // Ejecutar todas las reseñas
    if (reviewPromises.length > 0) {
      const createdReviews = await Promise.all(reviewPromises);
      totalReviews = createdReviews.length;
      console.log(`   ✅ ${totalReviews} nuevas reseñas creadas`);
    } else {
      const existingReviews = await Review.countDocuments();
      totalReviews = existingReviews;
      console.log(`   ✅ ${totalReviews} reseñas ya existentes`);
    }

    // ============================================
    // 5. ACTUALIZAR CALIFICACIONES DE CURSOS
    // ============================================
    console.log("📊 Paso 5: Actualizando calificaciones de cursos...");
    
    for (const course of courses) {
      const reviews = await Review.find({ course: course._id });
      
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await Course.findByIdAndUpdate(course._id, {
          rating: Math.round(avgRating * 10) / 10, // Redondear a 1 decimal
          ratingCount: reviews.length
        });
      }
    }
    console.log(`   ✅ Calificaciones actualizadas para todos los cursos\n`);

    // ============================================
    // 6. RESUMEN FINAL
    // ============================================
    console.log("=".repeat(50));
    console.log("📊 RESUMEN FINAL");
    console.log("=".repeat(50));
    console.log(`👥 Usuarios:`);
    console.log(`   - Instructores: ${instructors.length}`);
    console.log(`   - Estudiantes: ${students.length}`);
    console.log(`   - Total: ${instructors.length + students.length}`);
    console.log(`\n📚 Cursos: ${courses.length}`);
    console.log(`   - Con lecciones: ${courses.filter(c => c.lessons && c.lessons.length > 0).length}`);
    console.log(`\n📝 Inscripciones: ${totalEnrollments}`);
    console.log(`\n⭐ Reseñas: ${totalReviews}`);
    
    // Estadísticas adicionales
    const enrollmentsWithProgress = await Enrollment.find({ progress: { $gt: 0 } });
    const completedCourses = await Enrollment.find({ progress: 100 });
    const enrollmentsWithCompletedLessons = await Enrollment.find({ 
      completedLessons: { $exists: true, $ne: [] } 
    });
    
    console.log(`\n📈 Progreso:`);
    console.log(`   - Inscripciones con progreso: ${enrollmentsWithProgress.length}`);
    console.log(`   - Cursos completados: ${completedCourses.length}`);
    console.log(`   - Con lecciones completadas: ${enrollmentsWithCompletedLessons.length}`);
    
    // Promedio de progreso
    const avgProgress = await Enrollment.aggregate([
      { $group: { _id: null, avg: { $avg: "$progress" } } }
    ]);
    if (avgProgress.length > 0) {
      console.log(`   - Progreso promedio: ${Math.round(avgProgress[0].avg)}%`);
    }

    console.log("\n✅ ¡Todos los datos han sido relacionados exitosamente!");
    console.log("=".repeat(50));

    // Cerrar conexión
    await mongoose.connection.close();
    console.log("\n✅ Conexión cerrada");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al relacionar datos:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Ejecutar el script
relateAllData();


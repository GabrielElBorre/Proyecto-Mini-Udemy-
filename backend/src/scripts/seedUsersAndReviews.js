import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Review from "../models/Review.js";
import bcrypt from "bcryptjs";

dotenv.config();

const usersData = [
  {
    name: "María González",
    email: "maria.gonzalez@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://i.pravatar.cc/150?img=1"
  },
  {
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://i.pravatar.cc/150?img=2"
  },
  {
    name: "Ana Martínez",
    email: "ana.martinez@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://i.pravatar.cc/150?img=3"
  },
  {
    name: "Luis Hernández",
    email: "luis.hernandez@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://i.pravatar.cc/150?img=4"
  },
  {
    name: "Sofía López",
    email: "sofia.lopez@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://i.pravatar.cc/150?img=5"
  },
  {
    name: "Diego Pérez",
    email: "diego.perez@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://i.pravatar.cc/150?img=6"
  },
  {
    name: "Valentina Sánchez",
    email: "valentina.sanchez@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://i.pravatar.cc/150?img=7"
  },
  {
    name: "Andrés Ramírez",
    email: "andres.ramirez@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://i.pravatar.cc/150?img=8"
  },
  {
    name: "Isabella Torres",
    email: "isabella.torres@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://i.pravatar.cc/150?img=9"
  },
  {
    name: "Sebastián Flores",
    email: "sebastian.flores@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://i.pravatar.cc/150?img=10"
  },
  {
    name: "Camila Díaz",
    email: "camila.diaz@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://i.pravatar.cc/150?img=11"
  },
  {
    name: "Mateo Cruz",
    email: "mateo.cruz@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://i.pravatar.cc/150?img=12"
  },
  {
    name: "Lucía Morales",
    email: "lucia.morales@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://i.pravatar.cc/150?img=13"
  },
  {
    name: "Nicolás Vega",
    email: "nicolas.vega@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://i.pravatar.cc/150?img=14"
  },
  {
    name: "Emma Jiménez",
    email: "emma.jimenez@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://i.pravatar.cc/150?img=15"
  }
];

const reviewComments = [
  "Excelente curso, muy completo y bien explicado. Lo recomiendo totalmente.",
  "Muy bueno, aprendí mucho. El instructor explica de manera clara y concisa.",
  "Curso completo y actualizado. Los ejemplos prácticos son muy útiles.",
  "Buen contenido, aunque podría tener más ejercicios prácticos.",
  "Me encantó este curso. Superó mis expectativas completamente.",
  "Muy bien estructurado y fácil de seguir. Perfecto para principiantes.",
  "Excelente calidad de contenido. Vale cada peso invertido.",
  "Buen curso, pero algunos temas podrían estar más detallados.",
  "Muy recomendable. El instructor tiene mucha experiencia.",
  "Curso completo y profesional. Aprendí todo lo que necesitaba.",
  "Excelente para empezar. Los conceptos están bien explicados.",
  "Muy bueno, aunque algunos videos podrían ser más cortos.",
  "Curso de alta calidad. Los proyectos finales son muy útiles.",
  "Bien estructurado y con buen ritmo. Lo disfruté mucho.",
  "Excelente curso, muy completo. El instructor es muy claro.",
  "Muy bueno para aprender desde cero. Recomendado 100%.",
  "Curso completo y actualizado. Los recursos adicionales son geniales.",
  "Buen contenido, aunque algunos temas avanzados podrían estar mejor explicados.",
  "Me encantó. Aprendí mucho y pude aplicar los conocimientos inmediatamente.",
  "Excelente curso. El instructor tiene un gran dominio del tema."
];

async function seedUsersAndReviews() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Obtener todos los cursos
    const courses = await Course.find({ isPublished: true });
    if (courses.length === 0) {
      console.log("⚠️ No hay cursos en la base de datos. Ejecuta primero seedCourses.js");
      process.exit(1);
    }

    console.log(`📚 Encontrados ${courses.length} cursos`);

    // Crear usuarios
    const createdUsers = [];
    for (const userData of usersData) {
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠️ Usuario ${userData.email} ya existe, saltando...`);
        createdUsers.push(existingUser);
        continue;
      }

      // Hashear password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });
      createdUsers.push(user);
      console.log(`✅ Usuario creado: ${user.name} (${user.email})`);
    }

    console.log(`\n👥 Total de usuarios: ${createdUsers.length}`);

    // Inscribir usuarios en cursos aleatorios y crear reseñas
    let totalEnrollments = 0;
    let totalReviews = 0;

    for (const user of createdUsers) {
      // Cada usuario se inscribe en 3-8 cursos aleatorios
      const numCourses = Math.floor(Math.random() * 6) + 3; // 3 a 8 cursos
      const shuffledCourses = [...courses].sort(() => Math.random() - 0.5);
      const selectedCourses = shuffledCourses.slice(0, numCourses);

      for (const course of selectedCourses) {
        try {
          // Verificar si ya está inscrito
          const existingEnrollment = await Enrollment.findOne({
            student: user._id,
            course: course._id,
          });

          let enrollment;
          if (!existingEnrollment) {
            // Crear inscripción
            enrollment = await Enrollment.create({
              student: user._id,
              course: course._id,
              progress: Math.floor(Math.random() * 100), // Progreso aleatorio
            });
            totalEnrollments++;
            console.log(`  ✅ ${user.name} inscrito en: ${course.title}`);
          } else {
            enrollment = existingEnrollment;
          }

          // Crear reseña (70% de probabilidad de dejar reseña)
          if (Math.random() > 0.3) {
            const existingReview = await Review.findOne({
              student: user._id,
              course: course._id,
            });

            if (!existingReview) {
              const rating = Math.floor(Math.random() * 2) + 4; // 4 o 5 estrellas (mayormente positivas)
              const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];

              await Review.create({
                student: user._id,
                course: course._id,
                rating,
                comment,
              });
              totalReviews++;
              console.log(`    ⭐ Reseña creada: ${rating} estrellas`);
            }
          }
        } catch (err) {
          if (err.code !== 11000) { // Ignorar errores de duplicados
            console.error(`  ❌ Error con curso ${course.title}:`, err.message);
          }
        }
      }
    }

    // Actualizar ratings de los cursos
    console.log("\n🔄 Actualizando ratings de los cursos...");
    for (const course of courses) {
      const reviews = await Review.find({ course: course._id });
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        await Course.findByIdAndUpdate(course._id, {
          rating: Math.round(averageRating * 10) / 10,
          ratingCount: reviews.length,
        });
        console.log(`  ✅ ${course.title}: ${averageRating.toFixed(1)} ⭐ (${reviews.length} reseñas)`);
      }
    }

    console.log("\n✨ Seeding completado:");
    console.log(`   👥 Usuarios: ${createdUsers.length}`);
    console.log(`   📝 Inscripciones: ${totalEnrollments}`);
    console.log(`   ⭐ Reseñas: ${totalReviews}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

seedUsersAndReviews();



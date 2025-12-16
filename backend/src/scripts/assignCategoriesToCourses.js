import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/Category.js";
import Course from "../models/Course.js";

dotenv.config();

/**
 * Script para asignar categorías a los cursos existentes
 * Convierte las categorías de string a referencias ObjectId
 */

// Mapeo de nombres antiguos a nombres de categorías
const categoryMapping = {
  "Desarrollo": "Desarrollo",
  "Diseño": "Diseño",
  "Negocios": "Negocios",
  "Marketing": "Marketing",
  "Otros": "Otros"
};

async function assignCategoriesToCourses() {
  try {
    console.log("🚀 Iniciando asignación de categorías a cursos...\n");
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB\n");

    // Obtener todas las categorías
    const categories = await Category.find({});
    
    if (categories.length === 0) {
      console.log("⚠️  No hay categorías en la base de datos.");
      console.log("💡 Ejecuta primero: npm run seed:categories");
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`📚 Categorías disponibles (${categories.length}):`);
    categories.forEach(cat => {
      console.log(`   ${cat.icon} ${cat.name} (ID: ${cat._id})`);
    });
    console.log();

    // Crear un mapa de nombre de categoría a ObjectId
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Obtener todos los cursos
    const courses = await Course.find({});
    console.log(`📖 Encontrados ${courses.length} cursos\n`);

    if (courses.length === 0) {
      console.log("⚠️  No hay cursos en la base de datos.");
      await mongoose.connection.close();
      process.exit(0);
    }

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Actualizar cada curso
    for (const course of courses) {
      try {
        // Si el curso ya tiene una categoría como ObjectId, saltarlo
        if (course.category && typeof course.category === 'object' && course.category._id) {
          console.log(`   ⏭️  Curso "${course.title}" ya tiene categoría asignada (ObjectId)`);
          skipped++;
          continue;
        }

        // Si tiene categoría como string, convertirla
        let categoryId = null;
        
        if (typeof course.category === 'string') {
          const categoryName = course.category;
          categoryId = categoryMap[categoryName];
          
          if (!categoryId) {
            // Si no encuentra la categoría, usar "Otros" por defecto
            console.log(`   ⚠️  Categoría "${categoryName}" no encontrada para "${course.title}", usando "Otros"`);
            categoryId = categoryMap["Otros"];
          }
        } else {
          // Si no tiene categoría, usar "Otros" por defecto
          console.log(`   ⚠️  Curso "${course.title}" no tiene categoría, usando "Otros"`);
          categoryId = categoryMap["Otros"];
        }

        // Actualizar el curso
        await Course.findByIdAndUpdate(course._id, {
          $set: { category: categoryId }
        });

        const categoryName = categories.find(c => c._id.toString() === categoryId.toString())?.name || "Desconocida";
        console.log(`   ✅ "${course.title}" → ${categoryName}`);
        updated++;

      } catch (err) {
        console.error(`   ❌ Error al actualizar curso "${course.title}":`, err.message);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 RESUMEN");
    console.log("=".repeat(50));
    console.log(`✅ Cursos actualizados: ${updated}`);
    console.log(`⏭️  Cursos saltados (ya tenían categoría): ${skipped}`);
    if (errors > 0) {
      console.log(`❌ Errores: ${errors}`);
    }
    console.log("=".repeat(50));

    // Verificar resultados
    const coursesWithCategories = await Course.find({}).populate('category');
    console.log("\n📋 Verificación - Cursos con categorías:");
    const categoryCounts = {};
    coursesWithCategories.forEach(course => {
      const catName = course.category?.name || "Sin categoría";
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });
    
    Object.entries(categoryCounts).forEach(([name, count]) => {
      console.log(`   ${name}: ${count} curso(s)`);
    });

    console.log("\n✅ ¡Asignación de categorías completada!");

    // Cerrar conexión
    await mongoose.connection.close();
    console.log("\n✅ Conexión cerrada");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al asignar categorías:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Ejecutar el script
assignCategoriesToCourses();



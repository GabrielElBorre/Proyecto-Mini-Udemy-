import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/Category.js";

dotenv.config();

const categoriesData = [
  {
    name: "Desarrollo",
    description: "Cursos de programación, desarrollo web, aplicaciones móviles y software",
    icon: "💻",
    color: "#3b82f6" // azul
  },
  {
    name: "Diseño",
    description: "Diseño gráfico, UI/UX, diseño web, ilustración y creatividad",
    icon: "🎨",
    color: "#ec4899" // rosa
  },
  {
    name: "Negocios",
    description: "Emprendimiento, gestión empresarial, marketing digital y estrategia",
    icon: "💼",
    color: "#10b981" // verde
  },
  {
    name: "Marketing",
    description: "Marketing digital, publicidad, redes sociales y crecimiento",
    icon: "📈",
    color: "#f59e0b" // amarillo/naranja
  },
  {
    name: "Otros",
    description: "Otros temas y categorías diversas",
    icon: "📚",
    color: "#6366f1" // indigo
  }
];

async function seedCategories() {
  try {
    console.log("🚀 Iniciando creación de categorías...\n");
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB\n");

    // Verificar si ya existen categorías
    const existingCategories = await Category.find({});
    
    if (existingCategories.length > 0) {
      console.log(`⚠️  Ya existen ${existingCategories.length} categorías en la base de datos:`);
      existingCategories.forEach(cat => {
        console.log(`   - ${cat.icon} ${cat.name}`);
      });
      console.log("\n💡 Si quieres recrear las categorías, elimínalas primero.");
      await mongoose.connection.close();
      process.exit(0);
    }

    // Crear categorías
    const createdCategories = await Category.insertMany(categoriesData);
    
    console.log(`✅ ${createdCategories.length} categorías creadas exitosamente:\n`);
    createdCategories.forEach(cat => {
      console.log(`   ${cat.icon} ${cat.name} - ${cat.description}`);
    });

    console.log("\n✅ Categorías guardadas en la colección 'categories'");
    console.log("📝 Próximo paso: Ejecuta 'npm run relate' para asignar categorías a los cursos");

    // Cerrar conexión
    await mongoose.connection.close();
    console.log("\n✅ Conexión cerrada");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al crear categorías:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Ejecutar el script
seedCategories();



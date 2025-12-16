import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../models/Course.js";

dotenv.config();

async function makeAllCoursesFree() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Actualizar todos los cursos a precio 0
    const result = await Course.updateMany(
      {}, // Todos los cursos
      { $set: { price: 0 } }
    );

    console.log(`✅ ${result.modifiedCount} cursos actualizados a precio $0`);

    // Verificar que todos los cursos tienen precio 0
    const coursesWithPrice = await Course.countDocuments({ price: { $ne: 0 } });
    if (coursesWithPrice > 0) {
      console.log(`⚠️  Advertencia: ${coursesWithPrice} cursos aún tienen precio diferente de 0`);
    } else {
      console.log("✅ Todos los cursos tienen precio $0");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

makeAllCoursesFree();


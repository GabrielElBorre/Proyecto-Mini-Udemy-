import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { generalLimiter } from "./middleware/rateLimiter.js";

import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import instructorFollowRoutes from "./routes/instructorFollowRoutes.js";
import { cleanupExpiredSessions } from "./controllers/sessionController.js";
import path from "path";
dotenv.config();
const __dirname = new URL('.', import.meta.url).pathname;
// ✅ Primero inicializas la app
const app = express();

// ✅ Luego los middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Límite para imágenes/base64
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Configurar para obtener IP real del cliente (útil para sesiones)
// Solo confiar en el primer proxy (más seguro para rate limiting)
app.set('trust proxy', 1);

// Rate limiting general - excluir rutas GET de lectura para evitar 429
app.use("/api", (req, res, next) => {
  // No aplicar rate limiting a GET requests de lectura (cursos, categorías, etc.)
  // Esto evita que el rate limiter bloquee la navegación normal
  if (req.method === 'GET' && (
    req.path.startsWith('/courses') ||
    req.path.startsWith('/categories') ||
    (req.path.startsWith('/reviews') && !req.path.includes('/delete'))
  )) {
    return next(); // Saltar rate limiting para estas rutas
  }
  // Aplicar rate limiting a otras rutas (POST, PUT, DELETE)
  generalLimiter(req, res, next);
});

// ✅ Después las rutas
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/follow", instructorFollowRoutes);
// =======================
// SERVIR FRONTEND (React)
// =======================
app.use(express.static(
  path.join(__dirname, "../../frontend/dist")
));

// Fallback para React Router (SPA)
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/dist/index.html")
  );
});
// ✅ Ruta de prueba
//app.get("/", (req, res) => {
  //res.send("Backend funcionando 🚀");
//});

// ✅ Finalmente la conexión a MongoDB y levantar el servidor
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB conectado");
    app.listen(8000, () => {
      console.log("Servidor corriendo en puerto 8000");
      
      // Limpiar sesiones expiradas cada hora
      setInterval(async () => {
        await cleanupExpiredSessions();
      }, 60 * 60 * 1000); // Cada hora
      
      // Limpiar al iniciar
      cleanupExpiredSessions();
    });
  })
  .catch(err => console.error("Error de conexión:", err));

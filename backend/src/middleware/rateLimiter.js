import rateLimit from "express-rate-limit";

// Rate limiter para autenticación (más restrictivo)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por ventana
  message: "Demasiados intentos, por favor intenta más tarde",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Contar todos los intentos
  skipFailedRequests: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return ip;
  },
});

// Rate limiter para recuperación de contraseña (muy restrictivo)
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 intentos por hora
  message: "Demasiados intentos de recuperación de contraseña. Por favor, intenta más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return ip;
  },
});

// Rate limiter general (menos restrictivo)
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: isDevelopment ? 1000 : 200, // En desarrollo: 1000/min, en producción: 200/min
  message: "Demasiadas peticiones, por favor intenta más tarde",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar requests exitosos (solo errores)
  skipFailedRequests: false,
  // Configurar keyGenerator para usar IP real de forma segura
  keyGenerator: (req) => {
    // Obtener IP del cliente de forma segura
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return ip;
  },
  // Headers personalizados
  handler: (req, res) => {
    res.status(429).json({
      message: "Demasiadas peticiones, por favor intenta más tarde",
      retryAfter: 60, // segundos
    });
  },
});

// Rate limiter para creación de cursos
export const courseCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 cursos por hora
  message: "Demasiados cursos creados. Por favor, intenta más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return ip;
  },
});



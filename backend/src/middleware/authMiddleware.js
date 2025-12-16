import jwt from "jsonwebtoken";
import Session from "../models/Session.js";

// Tiempo de inactividad permitido (30 minutos)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos en milisegundos

export const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "No autorizado, token faltante" });
  }

  // Validar formato básico del token
  if (token.length < 10) {
    return res.status(401).json({ message: "Token inválido" });
  }

  try {
    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validar que el token tenga la estructura correcta
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Buscar sesión en la base de datos
    const session = await Session.findOne({ 
      token: token,
      user: decoded.id,
      isActive: true
    });

    if (!session) {
      return res.status(401).json({ message: "Sesión no encontrada o inactiva. Por favor, inicia sesión nuevamente" });
    }

    // Verificar si la sesión ha expirado
    if (session.expiresAt < new Date()) {
      session.isActive = false;
      await session.save();
      return res.status(401).json({ message: "Sesión expirada. Por favor, inicia sesión nuevamente" });
    }

    // Verificar inactividad (última actividad hace más de 30 minutos)
    const timeSinceLastActivity = Date.now() - new Date(session.lastActivity).getTime();
    if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
      session.isActive = false;
      await session.save();
      return res.status(401).json({ message: "Sesión cerrada por inactividad. Por favor, inicia sesión nuevamente" });
    }

    // Actualizar última actividad (solo si han pasado al menos 1 minuto para no sobrecargar la BD)
    // Esto asegura que la sesión se mantenga activa mientras el usuario navega
    const oneMinuteAgo = Date.now() - (1 * 60 * 1000);
    if (new Date(session.lastActivity).getTime() < oneMinuteAgo) {
      session.lastActivity = new Date();
      await session.save();
    }

    req.user = decoded; // { id, role }
    req.session = session; // Agregar sesión al request
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expirado. Por favor, inicia sesión nuevamente" });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Token inválido" });
    }
    console.error("Error en autenticación:", err);
    return res.status(401).json({ message: "Error de autenticación" });
  }
};

// Middleware opcional: no falla si no hay token, pero agrega req.user si existe
export const optionalAuth = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    req.user = null;
    req.session = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar sesión activa
    const session = await Session.findOne({ 
      token: token,
      user: decoded.id,
      isActive: true
    });

    if (session && session.expiresAt > new Date()) {
      req.user = decoded;
      req.session = session;
    } else {
      req.user = null;
      req.session = null;
    }
    next();
  } catch (err) {
    req.user = null;
    req.session = null;
    next();
  }
};

export const instructorOnly = (req, res, next) => {
  if (req.user.role !== "instructor") {
    return res.status(403).json({ message: "Acceso solo para instructores" });
  }
  next();
};
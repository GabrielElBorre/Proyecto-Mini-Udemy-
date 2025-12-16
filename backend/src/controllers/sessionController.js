import Session from "../models/Session.js";
import User from "../models/User.js";

/**
 * Obtener todas las sesiones activas del usuario
 */
export const getMySessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await Session.find({
      user: userId,
      isActive: true
    })
    .sort({ lastActivity: -1 })
    .select('-token') // No devolver el token por seguridad
    .lean();

    res.status(200).json({
      sessions: sessions,
      total: sessions.length
    });
  } catch (err) {
    console.error("Error al obtener sesiones:", err);
    res.status(500).json({ message: "Error al obtener sesiones", error: err.message });
  }
};

/**
 * Cerrar una sesión específica
 */
export const closeSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    const session = await Session.findOne({
      _id: sessionId,
      user: userId
    });

    if (!session) {
      return res.status(404).json({ message: "Sesión no encontrada" });
    }

    session.isActive = false;
    await session.save();

    res.status(200).json({ message: "Sesión cerrada exitosamente" });
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
    res.status(500).json({ message: "Error al cerrar sesión", error: err.message });
  }
};

/**
 * Cerrar todas las sesiones excepto la actual
 */
export const closeAllOtherSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentToken = req.headers.authorization?.split(" ")[1];

    await Session.updateMany(
      {
        user: userId,
        token: { $ne: currentToken },
        isActive: true
      },
      {
        isActive: false
      }
    );

    res.status(200).json({ message: "Todas las demás sesiones han sido cerradas" });
  } catch (err) {
    console.error("Error al cerrar sesiones:", err);
    res.status(500).json({ message: "Error al cerrar sesiones", error: err.message });
  }
};

/**
 * Cerrar la sesión actual
 */
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (token) {
      const session = await Session.findOne({ token: token });
      if (session) {
        session.isActive = false;
        await session.save();
        console.log(`✅ Sesión cerrada: ${session._id}`);
      }
    }

    res.status(200).json({ message: "Sesión cerrada exitosamente" });
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
    res.status(500).json({ message: "Error al cerrar sesión", error: err.message });
  }
};

/**
 * Limpiar sesiones expiradas o inactivas (para usar en un cron job)
 */
export const cleanupExpiredSessions = async () => {
  try {
    const now = new Date();
    const inactiveThreshold = new Date(now.getTime() - (30 * 60 * 1000)); // 30 minutos

    const result = await Session.updateMany(
      {
        $or: [
          { expiresAt: { $lt: now } },
          { lastActivity: { $lt: inactiveThreshold }, isActive: true }
        ]
      },
      {
        isActive: false
      }
    );

    console.log(`🧹 Limpieza de sesiones: ${result.modifiedCount} sesiones desactivadas`);
    return result.modifiedCount;
  } catch (err) {
    console.error("Error en limpieza de sesiones:", err);
    return 0;
  }
};


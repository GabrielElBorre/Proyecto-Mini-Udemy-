import User from "../models/User.js";
import Course from "../models/Course.js";
import Session from "../models/Session.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Enrollment from "../models/Enrollment.js";
import Review from "../models/Review.js";
import { validatePassword } from "../utils/passwordValidator.js";
import { sanitizeEmail, sanitizeName, containsMaliciousCode } from "../utils/sanitizer.js";

export const register = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    // Validar campos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // Sanitizar inputs
    name = sanitizeName(name);
    email = sanitizeEmail(email);

    // Validar que no contengan código malicioso
    if (containsMaliciousCode(name) || containsMaliciousCode(email)) {
      return res.status(400).json({ message: "Input contiene caracteres no permitidos" });
    }

    // Validar campos después de sanitización
    if (!name || name.length < 2) {
      return res.status(400).json({ message: "El nombre debe tener al menos 2 caracteres" });
    }

    if (name.length > 50) {
      return res.status(400).json({ message: "El nombre no puede exceder 50 caracteres" });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email inválido" });
    }

    // Validar contraseña segura
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
    });

    // Generar token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Devolver usuario sin contraseña
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      photoUrl: newUser.photoUrl || null,
    };

    res.status(201).json({ message: "Usuario registrado", token, user: userResponse });
  } catch (err) {
    console.error("Error en registro:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }
    res.status(500).json({ message: "Error en el registro", error: err.message });
  }
};

// Obtener perfil con estadísticas
export async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Obtener estadísticas
    const enrollments = await Enrollment.find({ student: userId });
    const reviews = await Review.find({ student: userId });
    const coursesCreated = await Course.countDocuments({ instructor: userId });

    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.progress === 100).length;
    const totalLessons = enrollments.reduce((sum, e) => {
      return sum + (e.completedLessons?.length || 0);
    }, 0);

    res.json({
      ...user.toObject(),
      stats: {
        totalCourses,
        completedCourses,
        totalLessons,
        totalReviews: reviews.length,
        coursesCreated: user.role === "instructor" ? coursesCreated : 0,
      }
    });
  } catch (err) {
    console.error("Error en getProfile:", err);
    res.status(500).json({ message: "Error al obtener perfil" });
  }
}

// Actualizar perfil
export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, photoUrl } = req.body;

    const updateData = {};
    if (name && name.trim()) {
      updateData.name = name.trim();
    }
    if (photoUrl !== undefined) {
      // Validar que si es base64, no exceda un tamaño razonable (2MB)
      if (photoUrl && photoUrl.startsWith('data:image/')) {
        // Validar tamaño aproximado de base64 (base64 es ~33% más grande que el archivo original)
        const base64Size = Buffer.byteLength(photoUrl, 'utf8');
        const maxSize = 2 * 1024 * 1024 * 1.33; // 2MB * factor base64
        
        if (base64Size > maxSize) {
          return res.status(400).json({ 
            message: "La imagen es demasiado grande. Por favor comprime la imagen o selecciona una más pequeña (máximo 2MB)" 
          });
        }

        // Validar formato de imagen
        const imageFormat = photoUrl.match(/data:image\/(\w+);base64/);
        if (!imageFormat || !['jpeg', 'jpg', 'png', 'gif', 'webp'].includes(imageFormat[1].toLowerCase())) {
          return res.status(400).json({ 
            message: "Formato de imagen no válido. Solo se permiten JPG, PNG, GIF o WEBP" 
          });
        }
      }
      
      // Guardar en la base de datos (puede ser URL o base64)
      updateData.photoUrl = photoUrl || null;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "Perfil actualizado", user: updatedUser });
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    res.status(500).json({ message: "Error al actualizar perfil", error: err.message });
  }
}

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Sanitizar email
    email = sanitizeEmail(email);

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email inválido" });
    }

    // Validar que la contraseña no esté vacía
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: "La contraseña es requerida" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Por seguridad, no revelar si el usuario existe o no
      // Usar el mismo tiempo de respuesta para evitar timing attacks
      await bcrypt.compare(password, "$2a$10$dummyHashToPreventTimingAttack");
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });

    // Generar token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Obtener información del dispositivo/cliente
    const ipAddress = req.ip || req.connection.remoteAddress || null;
    const userAgent = req.get('user-agent') || null;
    const deviceInfo = userAgent ? userAgent.substring(0, 100) : null; // Limitar longitud

    // Calcular fecha de expiración (7 días desde ahora)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Crear sesión en la base de datos
    const session = await Session.create({
      user: user._id,
      token: token,
      ipAddress: ipAddress,
      userAgent: userAgent,
      deviceInfo: deviceInfo,
      lastActivity: new Date(),
      expiresAt: expiresAt,
      isActive: true
    });

    console.log(`✅ Sesión creada para usuario ${user.email} - ID: ${session._id}`);

    // Devolver usuario sin contraseña
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      photoUrl: user.photoUrl,
    };

    res.status(200).json({ 
      message: "Login exitoso", 
      token, 
      user: userResponse,
      sessionId: session._id
    });
  } catch (err) {
    res.status(500).json({ message: "Error en el login", error: err.message });
  }
};

// Solicitar recuperación de contraseña
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "El email es requerido" });
    }

    const user = await User.findOne({ email });
    
    // Por seguridad, siempre devolvemos éxito aunque el usuario no exista
    // Esto previene que alguien descubra qué emails están registrados
    if (!user) {
      return res.status(200).json({ 
        message: "Si el email existe, recibirás un enlace para recuperar tu contraseña",
        // En producción, no devolverías el token. Aquí lo devolvemos para pruebas
        resetToken: null
      });
    }

    // Generar token de recuperación
    const crypto = await import("crypto");
    const resetToken = crypto.default.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Válido por 1 hora

    // Guardar token en la base de datos
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // En producción, aquí enviarías un email con el link
    // Para proyecto escolar, devolvemos el token en la respuesta
    // En producción usarías: await sendEmail(user.email, resetToken);
    
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

    // Para proyecto escolar, siempre devolvemos el token (en producción se enviaría por email)
    console.log("🔑 Token generado para:", email);
    console.log("🔗 URL de recuperación:", resetUrl);
    console.log("📝 Token completo:", resetToken);

    res.status(200).json({ 
      message: "Si el email existe, recibirás un enlace para recuperar tu contraseña",
      // Para proyecto escolar, siempre devolvemos el token para facilitar pruebas
      resetToken: resetToken,
      resetUrl: resetUrl,
      note: "En producción, este token se enviaría por email. Para pruebas, úsalo en: /reset-password?token=TOKEN"
    });
  } catch (err) {
    console.error("Error en forgotPassword:", err);
    res.status(500).json({ message: "Error al procesar la solicitud", error: err.message });
  }
};

// Resetear contraseña con token
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token y nueva contraseña son requeridos" });
    }

    // Validar contraseña segura
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Buscar usuario con el token válido
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // Token no expirado
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Token inválido o expirado. Por favor, solicita un nuevo enlace de recuperación." 
      });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar contraseña y limpiar token
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ 
      message: "Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña." 
    });
  } catch (err) {
    console.error("Error en resetPassword:", err);
    res.status(500).json({ message: "Error al restablecer la contraseña", error: err.message });
  }
};

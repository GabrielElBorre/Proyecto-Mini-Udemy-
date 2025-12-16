import { body, validationResult } from "express-validator";
import { validatePassword } from "../utils/passwordValidator.js";

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Errores de validación",
      errors: errors.array(),
    });
  }
  next();
};

// Validación personalizada de contraseña segura
const validateSecurePassword = (value) => {
  const result = validatePassword(value);
  if (!result.isValid) {
    throw new Error(result.message);
  }
  return true;
};

// Validaciones para registro
export const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage("El email no puede exceder 100 caracteres"),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .custom(validateSecurePassword),
  handleValidationErrors,
];

// Validaciones para login
export const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida"),
  handleValidationErrors,
];

// Validaciones para crear curso
export const validateCourse = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("El título es requerido")
    .isLength({ min: 3, max: 100 })
    .withMessage("El título debe tener entre 3 y 100 caracteres"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("La descripción es requerida")
    .isLength({ min: 10, max: 1000 })
    .withMessage("La descripción debe tener entre 10 y 1000 caracteres"),
  body("price")
    .notEmpty()
    .withMessage("El precio es requerido")
    .isFloat({ min: 0 })
    .withMessage("El precio debe ser un número positivo"),
  body("category")
    .optional()
    .isIn(["Desarrollo", "Diseño", "Negocios", "Marketing", "Otros"])
    .withMessage("Categoría inválida"),
  handleValidationErrors,
];



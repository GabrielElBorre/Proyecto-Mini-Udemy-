/**
 * Valida que una contraseña cumpla con los requisitos de seguridad:
 * - Mínimo 8 caracteres
 * - Al menos 1 mayúscula
 * - Al menos 1 minúscula
 * - Al menos 1 símbolo especial
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      message: "La contraseña es requerida"
    };
  }

  // Mínimo 8 caracteres
  if (password.length < 8) {
    return {
      isValid: false,
      message: "La contraseña debe tener al menos 8 caracteres"
    };
  }

  // Al menos una mayúscula
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "La contraseña debe contener al menos una letra mayúscula"
    };
  }

  // Al menos una minúscula
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "La contraseña debe contener al menos una letra minúscula"
    };
  }

  // Al menos un símbolo especial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      message: "La contraseña debe contener al menos un símbolo especial (!@#$%^&*()_+-=[]{}|;':\",./<>?)"
    };
  }

  // Máximo 128 caracteres por seguridad
  if (password.length > 128) {
    return {
      isValid: false,
      message: "La contraseña no puede exceder 128 caracteres"
    };
  }

  return {
    isValid: true,
    message: "Contraseña válida"
  };
}

/**
 * Obtiene un mensaje descriptivo de los requisitos de contraseña
 */
export function getPasswordRequirements() {
  return {
    minLength: 8,
    requirements: [
      "Mínimo 8 caracteres",
      "Al menos una letra mayúscula (A-Z)",
      "Al menos una letra minúscula (a-z)",
      "Al menos un símbolo especial (!@#$%^&*()_+-=[]{}|;':\",./<>?)"
    ]
  };
}


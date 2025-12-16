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
      message: "La contraseña es requerida",
      errors: []
    };
  }

  const errors = [];

  // Mínimo 8 caracteres
  if (password.length < 8) {
    errors.push("Mínimo 8 caracteres");
  }

  // Al menos una mayúscula
  if (!/[A-Z]/.test(password)) {
    errors.push("Al menos una letra mayúscula (A-Z)");
  }

  // Al menos una minúscula
  if (!/[a-z]/.test(password)) {
    errors.push("Al menos una letra minúscula (a-z)");
  }

  // Al menos un símbolo especial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Al menos un símbolo especial (!@#$%^&*()_+-=[]{}|;':\",./<>?)");
  }

  // Máximo 128 caracteres
  if (password.length > 128) {
    errors.push("Máximo 128 caracteres");
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      message: errors[0], // Primer error como mensaje principal
      errors: errors
    };
  }

  return {
    isValid: true,
    message: "Contraseña válida",
    errors: []
  };
}

/**
 * Obtiene un mensaje descriptivo de los requisitos de contraseña
 */
export function getPasswordRequirements() {
  return [
    "Mínimo 8 caracteres",
    "Al menos una letra mayúscula (A-Z)",
    "Al menos una letra minúscula (a-z)",
    "Al menos un símbolo especial (!@#$%^&*()_+-=[]{}|;':\",./<>?)"
  ];
}


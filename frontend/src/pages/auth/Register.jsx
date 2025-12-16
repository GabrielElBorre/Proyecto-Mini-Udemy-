import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUserPlus, FaUser, FaSpinner, FaCheckCircle, FaCheck, FaTimes } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Notification from "@/components/Notification";
import API from "../../api/api";
import useAuth from "@/hooks/useAuth";
import { validatePassword, getPasswordRequirements } from "../../utils/passwordValidator";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(null);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  
  const passwordRequirements = getPasswordRequirements();

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotification(null);

    // Validar campos vacíos
    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    // Validar nombre
    if (name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/.test(name.trim())) {
      setError("El nombre solo puede contener letras y espacios");
      return;
    }

    // Validar email
    if (!email.trim()) {
      setError("El email es requerido");
      return;
    }

    if (!validarEmail(email)) {
      setError("Por favor ingresa un email válido");
      return;
    }

    if (email.length > 100) {
      setError("El email no puede exceder 100 caracteres");
      return;
    }

    // Validar contraseña segura
    if (!password) {
      setError("La contraseña es requerida");
      return;
    }

    const passwordValidationResult = validatePassword(password);
    if (!passwordValidationResult.isValid) {
      setError(passwordValidationResult.message);
      setPasswordValidation(passwordValidationResult);
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post("/users/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      // Guardar token
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
      }
      
      setNotification({ message: "Registro exitoso 🚀", type: "success" });
      // Redirigir al home después del registro
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error("Error en registro:", err);
      
      let errorMsg = "Error al registrar ❌";
      
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMsg = err.response.data.errors.map(e => e.msg || e.message).join(", ");
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      setNotification({ message: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex justify-center items-center min-h-[90vh] py-12 px-4 bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white p-8 text-center relative overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full"
            />
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4"
              >
                <FaUserPlus className="text-4xl" />
              </motion.div>
              <CardTitle className="text-3xl font-bold mb-2">Crea tu cuenta</CardTitle>
              <p className="text-white/90 text-sm">Únete a nuestra comunidad de aprendizaje</p>
            </div>
          </div>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Nombre */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FaUser className="text-purple-500" />
                  Nombre Completo
                </Label>
                <div className="relative">
                  <Input 
                    id="name"
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError("");
                    }}
                    placeholder="Tu nombre completo"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-lg transition-all"
                    disabled={loading}
                  />
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </motion.div>

              {/* Campo Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FaEnvelope className="text-purple-500" />
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Input 
                    id="email"
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="tu@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-lg transition-all"
                    disabled={loading}
                  />
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </motion.div>

              {/* Campo Contraseña */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FaLock className="text-purple-500" />
                  Contraseña
                </Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required 
                    value={password}
                    onChange={(e) => {
                      const newPassword = e.target.value;
                      setPassword(newPassword);
                      setError("");
                      // Validar en tiempo real
                      if (newPassword.length > 0) {
                        const validation = validatePassword(newPassword);
                        setPasswordValidation(validation);
                      } else {
                        setPasswordValidation(null);
                      }
                    }}
                    placeholder="Mínimo 8 caracteres con mayúscula, minúscula y símbolo"
                    minLength={8}
                    className="w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-lg transition-all"
                    disabled={loading}
                  />
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                {/* Indicadores de validación de contraseña */}
                {password && password.length > 0 && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Requisitos de contraseña:</p>
                    <ul className="space-y-1">
                      {passwordRequirements.map((req, index) => {
                        const isValid = passwordValidation?.isValid || false;
                        let check = false;
                        if (req.includes("8 caracteres")) check = password.length >= 8;
                        else if (req.includes("mayúscula")) check = /[A-Z]/.test(password);
                        else if (req.includes("minúscula")) check = /[a-z]/.test(password);
                        else if (req.includes("símbolo")) check = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
                        
                        return (
                          <li key={index} className="flex items-center gap-2 text-xs">
                            {check ? (
                              <FaCheck className="text-green-500 flex-shrink-0" />
                            ) : (
                              <FaTimes className="text-red-500 flex-shrink-0" />
                            )}
                            <span className={check ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
                              {req}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </motion.div>

              {/* Mensaje de error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg"
                >
                  <p className="text-red-600 dark:text-red-400 text-sm text-center font-medium">{error}</p>
                </motion.div>
              )}

              {/* Botón de envío */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button 
                  className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" />
                      Creando cuenta...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FaUserPlus />
                      Crear Cuenta
                    </span>
                  )}
                </Button>
              </motion.div>

              {/* Link a login */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ¿Ya tienes una cuenta?{" "}
                  <Link 
                    to="/login" 
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold hover:underline transition-colors"
                  >
                    Inicia sesión aquí
                  </Link>
                </p>
              </motion.div>
            </form>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
            duration={3000}
          />
        )}
      </motion.div>
    </div>
  );
}
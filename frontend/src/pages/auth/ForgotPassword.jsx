import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaSpinner, FaCheckCircle, FaArrowLeft, FaKey, FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Notification from "@/components/Notification";
import API from "../../api/api";
import { validatePassword, getPasswordRequirements } from "../../utils/passwordValidator";

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(null);
  
  const passwordRequirements = getPasswordRequirements();

  // Si hay token, mostrar formulario de reset
  const isResetMode = !!token;

  async function handleForgotPassword(e) {
    e.preventDefault();
    setError("");
    setNotification(null);

    if (!email.trim()) {
      setError("El email es requerido");
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post("/users/forgot-password", { email: email.trim().toLowerCase() });
      
      console.log("📦 Respuesta completa del servidor:", data);
      
      setSuccess(true);
      
      // Mostrar el token en la consola SIEMPRE que exista
      if (data.resetToken) {
        console.log("=".repeat(60));
        console.log("🔑 TOKEN DE RECUPERACIÓN DE CONTRASEÑA");
        console.log("=".repeat(60));
        console.log("Token completo:", data.resetToken);
        console.log("URL completa:", data.resetUrl);
        console.log("=".repeat(60));
        console.log("💡 Copia este token y úsalo en:");
        console.log(`   ${data.resetUrl}`);
        console.log("=".repeat(60));
        
        setNotification({ 
          message: `${data.message}. Revisa la consola (F12) para ver el token y la URL.`, 
          type: "success",
          duration: 10000
        });
      } else {
        console.warn("⚠️ No se recibió token. Posibles razones:");
        console.warn("   - El email no existe en la base de datos");
        console.warn("   - Hubo un error en el servidor");
        console.warn("   - Respuesta del servidor:", data);
        
        setNotification({ 
          message: data.message || "Revisa la consola para más detalles", 
          type: "info",
          duration: 8000
        });
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMsg = err.response?.data?.message || "Error al procesar la solicitud";
      setError(errorMsg);
      setNotification({ message: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setNotification(null);

    if (!password) {
      setError("La nueva contraseña es requerida");
      return;
    }

    // Validar contraseña segura
    const passwordValidationResult = validatePassword(password);
    if (!passwordValidationResult.isValid) {
      setError(passwordValidationResult.message);
      setPasswordValidation(passwordValidationResult);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post("/users/reset-password", {
        token,
        password,
      });

      setSuccess(true);
      setNotification({ 
        message: data.message, 
        type: "success" 
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Error:", err);
      const errorMsg = err.response?.data?.message || "Error al restablecer la contraseña";
      setError(errorMsg);
      setNotification({ message: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  if (isResetMode) {
    // Formulario para resetear contraseña
    return (
      <div className="flex justify-center items-center min-h-[90vh] py-12 px-4 bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 text-center relative overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"
              />
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4"
                >
                  <FaKey className="text-4xl" />
                </motion.div>
                <CardTitle className="text-3xl font-bold mb-2">Nueva Contraseña</CardTitle>
                <p className="text-white/90 text-sm">Ingresa tu nueva contraseña</p>
              </div>
            </div>

            <CardContent className="p-8">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    ¡Contraseña restablecida!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Tu contraseña ha sido actualizada exitosamente.
                  </p>
                  <Button
                    onClick={() => navigate("/login")}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600"
                  >
                    Ir a Iniciar Sesión
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FaLock className="text-indigo-500" />
                      Nueva Contraseña
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
                        className="w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg transition-all"
                        disabled={loading}
                      />
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FaLock className="text-indigo-500" />
                      Confirmar Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError("");
                        }}
                        placeholder="Repite tu contraseña"
                        className="w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg transition-all"
                        disabled={loading}
                      />
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </motion.div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <p className="text-red-600 dark:text-red-400 text-sm text-center font-medium">{error}</p>
                    </motion.div>
                  )}

                  <Button
                    className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin" />
                        Restableciendo...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <FaKey />
                        Restablecer Contraseña
                      </span>
                    )}
                  </Button>

                  <div className="text-center">
                    <Link
                      to="/login"
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-2"
                    >
                      <FaArrowLeft />
                      Volver a Iniciar Sesión
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
              duration={notification.duration || 3000}
            />
          )}
        </motion.div>
      </div>
    );
  }

  // Formulario para solicitar recuperación
  return (
    <div className="flex justify-center items-center min-h-[90vh] py-12 px-4 bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 text-center relative overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"
            />
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4"
              >
                <FaEnvelope className="text-4xl" />
              </motion.div>
              <CardTitle className="text-3xl font-bold mb-2">Recuperar Contraseña</CardTitle>
              <p className="text-white/90 text-sm">Ingresa tu email para recibir el enlace de recuperación</p>
            </div>
          </div>

          <CardContent className="p-8">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  ¡Revisa tu email!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Si el email existe en nuestro sistema, recibirás un enlace para recuperar tu contraseña.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <strong>Nota para desarrollo:</strong> Revisa la consola del navegador (F12) para ver el token de recuperación y la URL.
                </p>
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  Volver a Iniciar Sesión
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FaEnvelope className="text-indigo-500" />
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
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg transition-all"
                      disabled={loading}
                    />
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <p className="text-red-600 dark:text-red-400 text-sm text-center font-medium">{error}</p>
                  </motion.div>
                )}

                <Button
                  className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FaEnvelope />
                      Enviar Enlace de Recuperación
                    </span>
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-2"
                  >
                    <FaArrowLeft />
                    Volver a Iniciar Sesión
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
            duration={notification.duration || 3000}
          />
        )}
      </motion.div>
    </div>
  );
}


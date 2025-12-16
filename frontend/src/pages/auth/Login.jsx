import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaSignInAlt, FaUser, FaSpinner } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Notification from "@/components/Notification";
import API from "../../api/api";
import useAuth from "@/hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotification(null);
    
    // Validación básica
    if (!email.trim()) {
      setError("El email es requerido");
      return;
    }
    
    if (!password) {
      setError("La contraseña es requerida");
      return;
    }

    setLoading(true);
    
    try {
      const { data } = await API.post("/users/login", { 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setNotification({ message: "Login correcto 🚀", type: "success" });
        setTimeout(() => navigate("/"), 1500);
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (err) {
      console.error("Error en login:", err);
      
      let errorMsg = "Error al iniciar sesión ❌";
      
      if (err.response) {
        // Error del servidor
        if (err.response.data) {
          if (err.response.data.message) {
            errorMsg = err.response.data.message;
          } else if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
            errorMsg = err.response.data.errors.map(e => e.msg || e.message).join(", ");
          }
        }
      } else if (err.request) {
        // Error de red
        errorMsg = "No se pudo conectar al servidor. Verifica que el backend esté corriendo.";
      } else {
        // Otro error
        errorMsg = err.message || errorMsg;
      }
      
      setError(errorMsg);
      setNotification({ message: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex justify-center items-center min-h-[90vh] py-12 px-4 bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 text-center relative overflow-hidden">
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
                <FaUser className="text-4xl" />
              </motion.div>
              <CardTitle className="text-3xl font-bold mb-2">Bienvenido de nuevo</CardTitle>
              <p className="text-white/90 text-sm">Inicia sesión para continuar tu aprendizaje</p>
            </div>
          </div>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
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

              {/* Campo Contraseña */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FaLock className="text-indigo-500" />
                  Contraseña
                </Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Ingresa tu contraseña"
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
                transition={{ delay: 0.5 }}
              >
                <Button 
                  className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" />
                      Iniciando sesión...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FaSignInAlt />
                      Iniciar Sesión
                    </span>
                  )}
                </Button>
              </motion.div>

              {/* Link a recuperar contraseña */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium hover:underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </motion.div>

              {/* Link a registro */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ¿No tienes una cuenta?{" "}
                  <Link 
                    to="/register" 
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold hover:underline transition-colors"
                  >
                    Regístrate aquí
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
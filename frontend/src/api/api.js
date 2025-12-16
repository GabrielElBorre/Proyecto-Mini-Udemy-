import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para agregar token automáticamente
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar error 429 (Too Many Requests)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      console.warn(`⚠️ Rate limit alcanzado. Espera ${retryAfter} segundos antes de intentar de nuevo.`);
      
      // No mostrar error 429 como fatal, solo como advertencia
      // El componente puede manejar esto mejor
      error.isRateLimit = true;
      error.retryAfter = retryAfter;
    }
    
    // Si el error es 401 (no autorizado), limpiar el token y notificar
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");
      if (token) {
        localStorage.removeItem("token");
        // Disparar evento para que AuthContext se actualice
        window.dispatchEvent(new Event("auth:logout"));
      }
      // Solo redirigir si no estamos en login o register
      if (!window.location.pathname.includes("/login") && 
          !window.location.pathname.includes("/register")) {
        // Esperar un poco para evitar loops
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export default API;

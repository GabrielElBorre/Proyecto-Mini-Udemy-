import { createContext, useState, useEffect, useCallback } from "react";
import API from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener el usuario (reutilizable)
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await API.get("/users/me");
      // Solo actualizar si los datos realmente cambiaron (comparar por _id)
      setUser(prevUser => {
        if (prevUser?._id === data?._id) {
          return prevUser; // No actualizar si es el mismo usuario
        }
        return data;
      });
      setLoading(false);
    } catch (err) {
      // Si hay error 401, limpiar sesión
      if (err.response?.status === 401) {
        setUser(null);
        localStorage.removeItem("token");
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    
    // Escuchar eventos de storage para sincronizar entre pestañas
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        if (e.newValue) {
          fetchUser();
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Escuchar evento de logout desde otros componentes
    const handleLogout = () => {
      setUser(null);
      localStorage.removeItem("token");
    };
    window.addEventListener("auth:logout", handleLogout);
    
    // Verificar sesión cuando se hace focus en la ventana (usuario vuelve a la pestaña)
    // Solo si no hay usuario o si ha pasado mucho tiempo desde la última verificación
    let lastFetchTime = Date.now();
    const handleFocus = () => {
      const token = localStorage.getItem("token");
      const timeSinceLastFetch = Date.now() - lastFetchTime;
      // Solo verificar si han pasado al menos 30 segundos desde la última verificación
      if (token && (!user || timeSinceLastFetch > 30000)) {
        lastFetchTime = Date.now();
        fetchUser();
      }
    };
    window.addEventListener("focus", handleFocus);
    
    // Verificar sesión periódicamente (cada 5 minutos para no sobrecargar)
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token) {
        lastFetchTime = Date.now();
        fetchUser();
      }
    }, 5 * 60 * 1000); // 5 minutos en lugar de 2

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth:logout", handleLogout);
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUser]); // Remover 'user' de las dependencias para evitar loops

  // Función para actualizar el usuario manualmente
  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  // Función para limpiar sesión
  const clearUser = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser: updateUser, 
      loading, 
      fetchUser,
      clearUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
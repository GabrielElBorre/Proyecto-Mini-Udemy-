import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";
import API from "../api/api";
import useAuth from "@/hooks/useAuth";
import Notification from "./Notification";

export default function FavoriteButton({ courseId, size = "md" }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (user && courseId) {
      checkFavorite();
    }
  }, [user, courseId]);

  const checkFavorite = async () => {
    try {
      const { data } = await API.get(`/favorites/check/${courseId}`);
      setIsFavorite(data.isFavorite);
    } catch (err) {
      // Silenciar error si no está autenticado
      if (err.response?.status !== 401) {
        console.error("Error al verificar favorito:", err);
      }
    }
  };

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setNotification({
        message: "Debes iniciar sesión para agregar favoritos",
        type: "warning"
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post(`/favorites/${courseId}`);
      setIsFavorite(data.isFavorite);
      setNotification({
        message: data.isFavorite 
          ? "Curso agregado a favoritos ❤️" 
          : "Curso eliminado de favoritos",
        type: "success"
      });
    } catch (err) {
      console.error("Error al gestionar favorito:", err);
      setNotification({
        message: "Error al gestionar favorito",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg"
  };

  return (
    <>
      <motion.button
        onClick={handleToggle}
        disabled={loading}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full transition-colors ${
          isFavorite
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        <FaHeart className={isFavorite ? "fill-current" : ""} />
      </motion.button>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={3000}
        />
      )}
    </>
  );
}


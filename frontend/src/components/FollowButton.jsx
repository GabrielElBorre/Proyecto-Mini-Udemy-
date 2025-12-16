import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import API from "../api/api";
import useAuth from "@/hooks/useAuth";
import { FaUserPlus, FaUserCheck } from "react-icons/fa";
import Notification from "./Notification";

export default function FollowButton({ instructorId, size = "md" }) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (user && instructorId) {
      checkFollow();
    }
  }, [user, instructorId]);

  const checkFollow = async () => {
    try {
      const { data } = await API.get(`/follow/check/${instructorId}`);
      setIsFollowing(data.isFollowing);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Error al verificar seguimiento:", err);
      }
    }
  };

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setNotification({
        message: "Debes iniciar sesión para seguir instructores",
        type: "warning"
      });
      return;
    }

    if (user._id === instructorId) {
      return; // No puede seguirse a sí mismo
    }

    setLoading(true);
    try {
      const { data } = await API.post(`/follow/${instructorId}`);
      setIsFollowing(data.isFollowing);
      setNotification({
        message: data.isFollowing 
          ? "Ahora sigues a este instructor 👥" 
          : "Dejaste de seguir a este instructor",
        type: "success"
      });
    } catch (err) {
      console.error("Error al gestionar seguimiento:", err);
      setNotification({
        message: err.response?.data?.message || "Error al gestionar seguimiento",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user._id === instructorId) return null;

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={handleToggle}
          disabled={loading}
          variant={isFollowing ? "default" : "outline"}
          size={size}
          className="gap-2"
        >
          {isFollowing ? (
            <>
              <FaUserCheck />
              Siguiendo
            </>
          ) : (
            <>
              <FaUserPlus />
              Seguir
            </>
          )}
        </Button>
      </motion.div>

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


import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Notification({ message, type = "success", onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: {
      bg: "bg-green-500",
      border: "border-green-500",
      icon: "✓",
    },
    error: {
      bg: "bg-red-500",
      border: "border-red-500",
      icon: "✕",
    },
    info: {
      bg: "bg-blue-500",
      border: "border-blue-500",
      icon: "ℹ",
    },
    warning: {
      bg: "bg-yellow-500",
      border: "border-yellow-500",
      icon: "⚠",
    },
  };

  const colorScheme = colors[type] || colors.success;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100]"
        >
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 ${colorScheme.border} p-6 min-w-[300px] max-w-md`}>
            <div className="flex items-center gap-4">
              {/* Icono animado */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.1 
                }}
                className="flex-shrink-0"
              >
                <div className={`w-12 h-12 ${colorScheme.bg} rounded-full flex items-center justify-center text-white text-xl font-bold`}>
                  {type === "success" ? (
                    <motion.svg
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </motion.svg>
                  ) : (
                    <span>{colorScheme.icon}</span>
                  )}
                </div>
              </motion.div>

              {/* Mensaje */}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-1 ${
                  type === "success" ? "text-green-800 dark:text-green-200" :
                  type === "error" ? "text-red-800 dark:text-red-200" :
                  type === "warning" ? "text-yellow-800 dark:text-yellow-200" :
                  "text-blue-800 dark:text-blue-200"
                }`}>
                  {type === "success" ? "¡Éxito!" :
                   type === "error" ? "Error" :
                   type === "warning" ? "Advertencia" :
                   "Información"}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {message}
                </p>
              </div>

              {/* Botón de cerrar */}
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => {
                    if (onClose) onClose();
                  }, 300);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



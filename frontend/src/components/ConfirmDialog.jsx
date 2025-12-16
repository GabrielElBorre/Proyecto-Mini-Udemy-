import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar acción",
  message = "¿Estás seguro de que quieres realizar esta acción?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger"
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              type === "danger" ? "bg-red-100 dark:bg-red-900" :
              type === "warning" ? "bg-yellow-100 dark:bg-yellow-900" :
              "bg-blue-100 dark:bg-blue-900"
            }`}>
              <span className={`text-2xl ${
                type === "danger" ? "text-red-600 dark:text-red-300" :
                type === "warning" ? "text-yellow-600 dark:text-yellow-300" :
                "text-blue-600 dark:text-blue-300"
              }`}>
                {type === "danger" ? "⚠️" : "ℹ️"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
              {title}
            </h3>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {message}
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              variant={type === "danger" ? "destructive" : "default"}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}



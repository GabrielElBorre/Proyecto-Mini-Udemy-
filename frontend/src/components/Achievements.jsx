import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import API from "../api/api";
import Notification from "./Notification";

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [newAchievement, setNewAchievement] = useState(null);

  useEffect(() => {
    fetchAchievements();
    fetchProgress();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data } = await API.get("/achievements");
      setAchievements(data.achievements || []);
    } catch (err) {
      console.error("Error al cargar logros:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const { data } = await API.get("/achievements/progress");
      setProgress(data.progress || []);
    } catch (err) {
      console.error("Error al cargar progreso:", err);
    }
  };

  const getColorClass = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      purple: "from-purple-500 to-purple-600",
      gold: "from-yellow-500 to-yellow-600",
      green: "from-green-500 to-green-600",
      indigo: "from-indigo-500 to-indigo-600",
      yellow: "from-yellow-400 to-yellow-500",
      orange: "from-orange-500 to-orange-600",
      cyan: "from-cyan-500 to-cyan-600",
      red: "from-red-500 to-red-600",
      pink: "from-pink-500 to-pink-600",
      gray: "from-gray-500 to-gray-600"
    };
    return colors[color] || colors.gray;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🏆 Mis Logros
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Desbloquea logros completando cursos y actividades
        </p>
      </div>

      {/* Logros desbloqueados */}
      {achievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Logros Desbloqueados ({achievements.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className={`bg-gradient-to-br ${getColorClass(achievement.info?.color)} text-white border-0 shadow-lg overflow-hidden`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{achievement.info?.icon || "🏅"}</div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold mb-1">
                          {achievement.info?.name || "Logro"}
                        </h4>
                        <p className="text-sm opacity-90 mb-3">
                          {achievement.info?.description || "Logro desbloqueado"}
                        </p>
                        <p className="text-xs opacity-75">
                          Desbloqueado: {new Date(achievement.unlockedAt).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Progreso hacia logros */}
      {progress.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            En Progreso
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progress.map((item, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{item.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Progreso: {item.current} / {item.target}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {Math.round(item.progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`bg-gradient-to-r ${getColorClass(item.color || "blue")} h-3 rounded-full`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje si no hay logros */}
      {achievements.length === 0 && progress.length === 0 && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Comienza tu viaje de aprendizaje!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Completa cursos, lecciones y deja reseñas para desbloquear logros increíbles.
            </p>
          </CardContent>
        </Card>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={5000}
        />
      )}
    </div>
  );
}


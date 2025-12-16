import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import API from "../api/api";
import { 
  FaBook, 
  FaCheckCircle, 
  FaStar, 
  FaGraduationCap,
  FaClock,
  FaTrophy
} from "react-icons/fa";

export default function LearningTimeline() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, enrollments, completions, reviews

  useEffect(() => {
    fetchTimelineData();
  }, [filter]);

  const fetchTimelineData = async () => {
    try {
      const [enrollmentsRes, achievementsRes] = await Promise.all([
        API.get("/enrollments/my-courses"),
        API.get("/achievements")
      ]);

      const enrollments = enrollmentsRes.data || [];
      const achievements = achievementsRes.data?.achievements || [];

      // Crear eventos de la línea de tiempo
      const timelineEvents = [];

      // Eventos de inscripciones
      enrollments.forEach(enrollment => {
        timelineEvents.push({
          type: "enrollment",
          date: new Date(enrollment.enrolledAt),
          title: `Inscrito en "${enrollment.course?.title || "Curso"}"`,
          description: `Te inscribiste en un nuevo curso`,
          icon: FaBook,
          color: "blue"
        });

        // Eventos de completación
        if (enrollment.completedAt) {
          timelineEvents.push({
            type: "completion",
            date: new Date(enrollment.completedAt),
            title: `Completado: "${enrollment.course?.title || "Curso"}"`,
            description: `¡Felicidades! Completaste el curso al 100%`,
            icon: FaGraduationCap,
            color: "green",
            progress: enrollment.progress
          });
        }
      });

      // Eventos de logros
      achievements.forEach(achievement => {
        timelineEvents.push({
          type: "achievement",
          date: new Date(achievement.unlockedAt),
          title: `Logro Desbloqueado: ${achievement.info?.name || "Logro"}`,
          description: achievement.info?.description || "Nuevo logro desbloqueado",
          icon: FaTrophy,
          color: achievement.info?.color || "gold",
          achievement: achievement
        });
      });

      // Ordenar por fecha (más reciente primero)
      timelineEvents.sort((a, b) => b.date - a.date);

      // Aplicar filtro
      let filteredEvents = timelineEvents;
      if (filter !== "all") {
        filteredEvents = timelineEvents.filter(e => e.type === filter);
      }

      setEvents(filteredEvents);
    } catch (err) {
      console.error("Error al cargar timeline:", err);
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-500 border-blue-500 text-blue-600",
      green: "bg-green-500 border-green-500 text-green-600",
      gold: "bg-yellow-500 border-yellow-500 text-yellow-600",
      purple: "bg-purple-500 border-purple-500 text-purple-600",
      orange: "bg-orange-500 border-orange-500 text-orange-600",
      red: "bg-red-500 border-red-500 text-red-600",
      pink: "bg-pink-500 border-pink-500 text-pink-600"
    };
    return colors[color] || colors.blue;
  };

  const getIconBgColor = (color) => {
    const colors = {
      blue: "bg-blue-100 dark:bg-blue-900/30",
      green: "bg-green-100 dark:bg-green-900/30",
      gold: "bg-yellow-100 dark:bg-yellow-900/30",
      purple: "bg-purple-100 dark:bg-purple-900/30",
      orange: "bg-orange-100 dark:bg-orange-900/30",
      red: "bg-red-100 dark:bg-red-900/30",
      pink: "bg-pink-100 dark:bg-pink-900/30"
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            📅 Timeline de Aprendizaje
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Tu viaje de aprendizaje paso a paso
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">Todos</option>
          <option value="enrollment">Inscripciones</option>
          <option value="completion">Completaciones</option>
          <option value="achievement">Logros</option>
        </select>
      </div>

      {events.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Aún no hay eventos
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Comienza a aprender para ver tu timeline aquí
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500"></div>

          <div className="space-y-6">
            {events.map((event, index) => {
              const Icon = event.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start gap-6"
                >
                  {/* Icono en la línea */}
                  <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full ${getIconBgColor(event.color)} border-4 border-white dark:border-gray-800 shadow-lg`}>
                    <Icon className={`text-2xl ${getColorClasses(event.color).split(" ")[2]}`} />
                  </div>

                  {/* Contenido del evento */}
                  <div className="flex-1 pt-2">
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                              {event.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {event.description}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                            {event.date.toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        {event.progress !== undefined && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Progreso:</span>
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                                  style={{ width: `${event.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {event.progress}%
                              </span>
                            </div>
                          </div>
                        )}
                        {event.achievement && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{event.achievement.info?.icon}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {event.achievement.info?.description}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


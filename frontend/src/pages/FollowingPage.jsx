import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import API from "../api/api";
import useAuth from "@/hooks/useAuth";
import CourseCard from "@/components/CourseCard";
import { FaUserCheck, FaUserPlus, FaBook } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Notification from "@/components/Notification";

export default function FollowingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (user) {
      fetchFollowing();
    }
  }, [user]);

  const fetchFollowing = async () => {
    try {
      const { data } = await API.get("/follow/following");
      setInstructors(data.instructors || []);
    } catch (err) {
      console.error("Error al cargar instructores seguidos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (instructorId) => {
    try {
      await API.post(`/follow/${instructorId}`);
      setNotification({
        message: "Dejaste de seguir al instructor",
        type: "success"
      });
      fetchFollowing();
    } catch (err) {
      console.error("Error al dejar de seguir:", err);
      setNotification({
        message: "Error al dejar de seguir",
        type: "error"
      });
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Debes iniciar sesión para ver instructores seguidos
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            👥 Instructores Seguidos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cursos de instructores que sigues ({instructors.length})
          </p>
        </div>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <FaBook className="text-sm" />
            Explorar Cursos
          </Button>
        </Link>
      </div>

      {instructors.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-12 text-center">
            <FaUserPlus className="text-6xl mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No sigues a ningún instructor
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sigue a instructores para recibir notificaciones de sus nuevos cursos
            </p>
            <Link to="/">
              <Button>
                Explorar Cursos
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {instructors.map((instructor, index) => (
            <motion.div
              key={instructor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={instructor.photoUrl || "https://placehold.co/80x80"}
                      alt={instructor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {instructor.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {instructor.email}
                      </p>
                      {instructor.courses && instructor.courses.length > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          {instructor.courses.length} curso{instructor.courses.length !== 1 ? 's' : ''} disponible{instructor.courses.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnfollow(instructor._id)}
                      className="gap-2"
                    >
                      <FaUserCheck className="text-sm" />
                      Siguiendo
                    </Button>
                  </div>

                  {instructor.courses && instructor.courses.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Cursos de {instructor.name}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {instructor.courses.map((course) => (
                          <CourseCard key={course._id} course={course} />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={3000}
        />
      )}
    </div>
  );
}


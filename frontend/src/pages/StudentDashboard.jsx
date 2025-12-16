import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProgressChart from "@/components/ProgressChart";
import API from "../api/api";
import useAuth from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaSearch, FaTrophy, FaClock, FaBook, FaCheckCircle, FaFilter } from "react-icons/fa";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, in-progress, completed
  const [sortBy, setSortBy] = useState("recent"); // recent, progress, title

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        const [coursesRes, statsRes] = await Promise.all([
          API.get("/enrollments/my-courses"),
          API.get("/enrollments/stats")
        ]);
        setEnrollments(coursesRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600 dark:text-gray-400">Debes iniciar sesión para ver tu dashboard</p>
      </div>
    );
  }

  if (user.role === "instructor") {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600 dark:text-gray-400">Esta es la vista de estudiante</p>
        <Button className="mt-4" onClick={() => window.location.href = "/instructor"}>
          Ir a Dashboard de Instructor
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-lg text-gray-600 dark:text-gray-400">Cargando tus cursos...</p>
      </div>
    );
  }

  // Filtrar y ordenar cursos
  const filteredEnrollments = enrollments
    .filter(enrollment => {
      const matchesSearch = enrollment.course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filter === "all" ||
        (filter === "in-progress" && enrollment.progress < 100) ||
        (filter === "completed" && enrollment.progress === 100);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "progress") {
        return b.progress - a.progress;
      } else if (sortBy === "title") {
        return a.course.title.localeCompare(b.course.title);
      } else {
        // recent
        return new Date(b.enrolledAt) - new Date(a.enrolledAt);
      }
    });

  // Calcular tiempo estimado de finalización
  const calculateEstimatedTime = (enrollment) => {
    if (!enrollment.course.lessons || enrollment.course.lessons.length === 0) return null;
    
    const totalMinutes = enrollment.course.lessons.reduce((sum, lesson) => 
      sum + (lesson.duration || 0), 0
    );
    const completedMinutes = enrollment.course.lessons
      .filter(lesson => enrollment.completedLessons.some(id => 
        id.toString() === lesson._id?.toString()
      ))
      .reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
    
    const remainingMinutes = totalMinutes - completedMinutes;
    if (remainingMinutes <= 0) return null;
    
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Formatear tiempo de estudio
  const formatStudyTime = (minutes) => {
    if (!minutes) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mi Dashboard de Aprendizaje 📚
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona tu progreso y continúa aprendiendo
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <FaBook className="text-sm" />
              Explorar Cursos
            </Button>
          </Link>
          <Link to="/achievements">
            <Button variant="outline" className="gap-2">
              🏆 Logros
            </Button>
          </Link>
          <Link to="/analytics">
            <Button variant="outline" className="gap-2">
              📊 Analytics
            </Button>
          </Link>
          <Link to="/timeline">
            <Button variant="outline" className="gap-2">
              📅 Timeline
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas generales mejoradas */}
      {stats && stats.totalCourses > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FaBook className="text-2xl opacity-80" />
                <span className="text-4xl font-bold">{stats.totalCourses}</span>
              </div>
              <p className="text-sm opacity-90">Cursos Inscritos</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FaCheckCircle className="text-2xl opacity-80" />
                <span className="text-4xl font-bold">{stats.completedLessons}/{stats.totalLessons}</span>
              </div>
              <p className="text-sm opacity-90">Lecciones Completadas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FaTrophy className="text-2xl opacity-80" />
                <span className="text-4xl font-bold">{stats.averageProgress}%</span>
              </div>
              <p className="text-sm opacity-90">Progreso Promedio</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FaClock className="text-2xl opacity-80" />
                <span className="text-2xl font-bold">{formatStudyTime(stats.totalStudyTime)}</span>
              </div>
              <p className="text-sm opacity-90">Tiempo de Estudio</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filtros y búsqueda */}
      {enrollments.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtro */}
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className="gap-2"
              >
                <FaFilter className="text-sm" />
                Todos
              </Button>
              <Button
                variant={filter === "in-progress" ? "default" : "outline"}
                onClick={() => setFilter("in-progress")}
              >
                En Progreso
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                onClick={() => setFilter("completed")}
              >
                Completados
              </Button>
            </div>
            
            {/* Ordenamiento */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="recent">Más Recientes</option>
              <option value="progress">Por Progreso</option>
              <option value="title">Por Título</option>
            </select>
          </div>
        </div>
      )}

      {enrollments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Aún no te has inscrito a ningún curso
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Explora nuestra biblioteca de cursos y comienza tu viaje de aprendizaje
              </p>
              <Link to="/">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  Explorar Cursos Disponibles
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ) : filteredEnrollments.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-8 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              No se encontraron cursos con los filtros seleccionados
            </p>
            <Button onClick={() => { setSearchTerm(""); setFilter("all"); }}>
              Limpiar Filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enrollment, index) => {
            const course = enrollment.course;
            const totalLessons = course.lessons?.length || 0;
            const completedLessons = enrollment.completedLessons?.length || 0;

            const estimatedTime = calculateEstimatedTime(enrollment);
            const isCompleted = enrollment.progress === 100;

            return (
              <motion.div
                key={enrollment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                    isCompleted ? "ring-2 ring-green-500 dark:ring-green-400" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="mb-4 relative">
                      <img
                        src={course.imageUrl || "https://placehold.co/400x200"}
                        alt={course.title}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/400x200/6366f1/ffffff?text=Curso";
                        }}
                      />
                      {isCompleted && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <FaTrophy /> Completado
                        </div>
                      )}
                      <h2 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white line-clamp-2">
                        {course.title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Por {course.instructor?.name || "Instructor"}
                      </p>
                    </div>

                    {totalLessons > 0 ? (
                      <div className="mb-4 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">Progreso</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {enrollment.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${enrollment.progress}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                          <span>
                            {completedLessons} de {totalLessons} lecciones
                          </span>
                          {estimatedTime && (
                            <span className="flex items-center gap-1">
                              <FaClock className="text-xs" />
                              {estimatedTime} restantes
                            </span>
                          )}
                        </div>
                        {isCompleted && enrollment.completedAt && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                                  <FaTrophy className="text-yellow-500" />
                                  ¡Curso Completado!
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  Completado el {new Date(enrollment.completedAt).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center py-2">
                        Este curso aún no tiene lecciones
                      </p>
                    )}

                    <div className="space-y-2">
                      <Link to={`/curso/${course._id}`} className="block">
                        <Button 
                          className={`w-full ${
                            isCompleted 
                              ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                          }`}
                        >
                          {isCompleted ? "🎉 Ver Certificado" : "▶️ Continuar Aprendiendo"}
                        </Button>
                      </Link>
                      {!isCompleted && totalLessons > 0 && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);
                            const nextLesson = sortedLessons.find(lesson => 
                              !enrollment.completedLessons.some(id => 
                                id.toString() === lesson._id?.toString()
                              )
                            ) || sortedLessons[0];
                            if (nextLesson) {
                              if (nextLesson._id) {
                                console.log("🔍 [Dashboard] Navegando a lección:", nextLesson._id);
                                navigate(`/curso/${course._id}/leccion/${nextLesson._id}`);
                              } else {
                                const lessonIndex = sortedLessons.indexOf(nextLesson);
                                console.log("🔍 [Dashboard] Navegando a lección por índice:", lessonIndex + 1);
                                navigate(`/curso/${course._id}/leccion/${lessonIndex + 1}`);
                              }
                            }
                          }}
                        >
                          Ir a la siguiente lección
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
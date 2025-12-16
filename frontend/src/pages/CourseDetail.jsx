import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import API from "../api/api";
import useAuth from "@/hooks/useAuth";
import Rating from "@/components/Rating";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import Notification from "@/components/Notification";
import Certificate from "@/components/Certificate";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButtons from "@/components/ShareButtons";
import FollowButton from "@/components/FollowButton";
import { FaDownload, FaExternalLinkAlt } from "react-icons/fa";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [notification, setNotification] = useState(null);
  
  // Estado para la imagen del curso (debe estar antes de los returns)
  const defaultImage = "https://placehold.co/800x400/6366f1/ffffff?text=Curso";
  const [imageUrl, setImageUrl] = useState(defaultImage);

  useEffect(() => {
    async function fetchCourse() {
      if (!id) {
        console.error("❌ No hay ID de curso en la URL");
        setError("ID de curso no válido");
        setLoading(false);
        return;
      }

      try {
        console.log("🔍 [CourseDetail] Iniciando carga de curso con ID:", id);
        setLoading(true);
        setError("");
        
        const response = await API.get(`/courses/${id}`);
        console.log("✅ [CourseDetail] Respuesta del servidor:", response);
        console.log("✅ [CourseDetail] Data recibida:", response.data);
        
        if (!response || !response.data) {
          throw new Error("Respuesta inválida del servidor");
        }
        
        if (!response.data.course) {
          throw new Error("Curso no encontrado en la respuesta");
        }
        
        console.log("✅ [CourseDetail] Curso encontrado:", response.data.course.title);
        setCourse(response.data.course);
        setEnrollment(response.data.enrollment || null);
        setError("");
      } catch (err) {
        console.error("❌ [CourseDetail] Error completo:", err);
        console.error("❌ [CourseDetail] Error response:", err.response);
        console.error("❌ [CourseDetail] Error data:", err.response?.data);
        console.error("❌ [CourseDetail] Error message:", err.message);
        
        let errorMsg = "Error al cargar el curso";
        
        if (err.response?.status === 429) {
          errorMsg = "Demasiadas peticiones. Espera un momento e intenta de nuevo.";
        } else if (err.response?.status === 404) {
          errorMsg = "Curso no encontrado";
        } else if (err.response?.status === 401) {
          errorMsg = "No autorizado. Por favor, inicia sesión";
        } else if (err.response?.status === 500) {
          errorMsg = "Error del servidor. Por favor, intenta más tarde";
        } else if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        } else if (err.message) {
          errorMsg = err.message;
        } else if (!err.response) {
          errorMsg = "No se pudo conectar al servidor. Verifica que el backend esté corriendo.";
        }
        
        console.error("❌ [CourseDetail] Mensaje de error final:", errorMsg);
        
        // Si es rate limit (429), reintentar después de un momento
        if (err.isRateLimit || err.response?.status === 429) {
          console.warn("⚠️ [CourseDetail] Rate limit (429), reintentando en 3 segundos...");
          setError("Demasiadas peticiones. Reintentando...");
          setTimeout(() => {
            fetchCourse();
          }, 3000);
          return;
        }
        
        setError(errorMsg);
        setNotification({ message: errorMsg, type: "error" });
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchCourse();
    }
  }, [id, refreshReviews]);

  // Actualizar imageUrl cuando cambie el curso (debe estar antes de los returns)
  useEffect(() => {
    if (course?.imageUrl) {
      setImageUrl(course.imageUrl);
    } else {
      setImageUrl(defaultImage);
    }
  }, [course]);

  const handleImageError = () => {
    setImageUrl(defaultImage);
  };

  async function handleEnroll() {
    if (!user) {
      setNotification({ message: "Debes iniciar sesión para inscribirte", type: "warning" });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    if (user.role === "instructor") {
      setNotification({ message: "Los instructores no pueden inscribirse a cursos", type: "warning" });
      return;
    }

    try {
      console.log("📝 [CourseDetail] Inscribiendo usuario al curso:", id);
      setLoading(true);
      
      const { data } = await API.post("/enrollments", { courseId: id });
      
      console.log("✅ [CourseDetail] Inscripción exitosa:", data);
      
      // Actualizar el enrollment local
      setEnrollment(data.enrollment);
      
      // Recargar el curso para obtener datos actualizados
      const courseResponse = await API.get(`/courses/${id}`);
      setCourse(courseResponse.data.course);
      setEnrollment(courseResponse.data.enrollment);
      
      setNotification({ 
        message: "¡Te has inscrito exitosamente! 🎉 Ya puedes acceder a las lecciones.", 
        type: "success" 
      });
      
      // Opcional: redirigir a la primera lección después de 2 segundos
      setTimeout(() => {
        if (courseResponse.data.course.lessons && courseResponse.data.course.lessons.length > 0) {
          const firstLesson = courseResponse.data.course.lessons.sort((a, b) => a.order - b.order)[0];
          if (firstLesson) {
            navigate(`/curso/${id}/leccion/${firstLesson._id || 1}`);
          }
        }
      }, 2000);
    } catch (err) {
      console.error("❌ [CourseDetail] Error al inscribirse:", err);
      const errorMsg = err.response?.data?.message || "Error al inscribirse";
      setNotification({ message: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  console.log("🔍 [CourseDetail Render] Estado actual:", { loading, error, hasCourse: !!course, courseId: id });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-lg text-gray-600 dark:text-gray-400">Cargando curso...</p>
        {id && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">ID: {id}</p>
        )}
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] p-6">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {error || "Curso no encontrado"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
          El curso que buscas no existe o no está disponible.
        </p>
        {id && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            ID del curso: {id}
          </p>
        )}
        <Button 
          onClick={() => navigate("/")} 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          Volver al inicio
        </Button>
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

  const isEnrolled = enrollment !== null;
  const isInstructor = user && user.role === "instructor";
  const instructorId = course?.instructor?._id || course?.instructor;
  const isOwner = user && instructorId && (instructorId === user._id || instructorId.toString() === user._id?.toString());

  return (
    <div className="max-w-4xl mx-auto">
      <img 
        src={imageUrl} 
        alt={course.title}
        className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg" 
        onError={handleImageError}
      />

      <div className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <p className="text-gray-600 dark:text-gray-400">
                Por <span className="font-semibold">{course.instructor.name}</span>
              </p>
              {course.instructor._id && (
                <FollowButton instructorId={course.instructor._id} size="sm" />
              )}
              {course.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Rating rating={course.rating} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({course.ratingCount} calificaciones)
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton courseId={course._id} />
            <ShareButtons course={course} />
          </div>
        </div>
      </div>

      <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          {course.price === 0 ? (
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">Gratis</span>
          ) : (
            <span className="text-2xl font-bold text-gray-900 dark:text-white">${course.price}</span>
          )}
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold">
            {typeof course.category === 'object' && course.category !== null
              ? course.category.name || course.category
              : course.category || "Sin categoría"}
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{course.description}</p>
      </div>

      <div className="mt-6 space-y-3">
        {isEnrolled ? (
          <>
            {/* Mostrar progreso si está inscrito */}
            {course.lessons && course.lessons.length > 0 && (
              <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tu Progreso</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {enrollment?.progress || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${enrollment?.progress || 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {enrollment?.completedLessons?.length || 0} de {course.lessons.length} lecciones completadas
                </p>
              </div>
            )}
            
            <Button 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" 
              onClick={() => {
                // Ir a la primera lección no completada o a la primera lección
                if (course.lessons && course.lessons.length > 0) {
                  const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);
                  const nextLesson = sortedLessons.find(lesson => 
                    !enrollment?.completedLessons?.some(id => 
                      id.toString() === lesson._id?.toString()
                    )
                  ) || sortedLessons[0];
                  
                  if (nextLesson && nextLesson._id) {
                    console.log("🔍 [CourseDetail] Navegando a lección:", nextLesson._id, nextLesson.title);
                    navigate(`/curso/${id}/leccion/${nextLesson._id}`);
                  } else if (nextLesson) {
                    // Si no tiene _id, usar el índice + 1
                    const lessonIndex = sortedLessons.indexOf(nextLesson);
                    console.log("🔍 [CourseDetail] Navegando a lección por índice:", lessonIndex + 1);
                    navigate(`/curso/${id}/leccion/${lessonIndex + 1}`);
                  } else {
                    console.warn("⚠️ [CourseDetail] No se encontró siguiente lección");
                    navigate("/dashboard");
                  }
                } else {
                  navigate("/dashboard");
                }
              }}
            >
              {enrollment?.progress === 100 ? "🎉 Ver Curso Completado" : "▶️ Continuar Curso"}
            </Button>
            <Button 
              variant="outline"
              className="w-full" 
              onClick={() => navigate("/dashboard")}
            >
              Ver en Mi Dashboard
            </Button>
          </>
        ) : isOwner ? (
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
            onClick={() => navigate("/instructor")}
          >
            Gestionar Curso
          </Button>
        ) : (
          <Button 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" 
            onClick={handleEnroll}
            disabled={!user || isInstructor || loading}
          >
            {loading ? "Inscribiendo..." : !user ? "Inicia sesión para inscribirte" : "📚 Inscribirse al Curso"}
          </Button>
        )}
      </div>

      {course.lessons && course.lessons.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Lecciones del Curso ({course.lessons.length})
            </h2>
            {isEnrolled && enrollment && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {enrollment.completedLessons?.length || 0} de {course.lessons.length} completadas
              </div>
            )}
          </div>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 space-y-2">
              {course.lessons
                .sort((a, b) => a.order - b.order)
                .map((lesson, i) => {
                  const isLessonCompleted = isEnrolled && enrollment?.completedLessons?.some(id => 
                    id.toString() === lesson._id?.toString()
                  );
                  const isNextLesson = isEnrolled && !isLessonCompleted && 
                    (i === 0 || course.lessons
                      .sort((a, b) => a.order - b.order)
                      .slice(0, i)
                      .every(l => enrollment?.completedLessons?.some(id => id.toString() === l._id?.toString()))
                    );

                  return (
                    <div 
                      key={lesson._id || i} 
                      className={`flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg transition-all ${
                        isNextLesson 
                          ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-200 dark:ring-indigo-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold ${
                          isLessonCompleted
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : isNextLesson
                            ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}>
                          {isLessonCompleted ? "✓" : i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">{lesson.title}</p>
                            {isNextLesson && (
                              <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full font-semibold">
                                Siguiente
                              </span>
                            )}
                          </div>
                          {lesson.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                              {lesson.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            {lesson.duration && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                ⏱️ {lesson.duration} min
                              </span>
                            )}
                            {isLessonCompleted && (
                              <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                                ✓ Completada
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEnrolled ? (
                          <>
                            {!isLessonCompleted && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    await API.put("/enrollments/progress", {
                                      enrollmentId: enrollment._id,
                                      lessonId: lesson._id,
                                    });
                                    const { data } = await API.get(`/courses/${id}`);
                                    setCourse(data.course);
                                    setEnrollment(data.enrollment);
                                    setNotification({ 
                                      message: `"${lesson.title}" marcada como completada ✓`, 
                                      type: "success" 
                                    });
                                  } catch (err) {
                                    console.error("Error al actualizar progreso:", err);
                                    setNotification({ 
                                      message: "Error al marcar lección como completada", 
                                      type: "error" 
                                    });
                                  }
                                }}
                              >
                                Marcar completada
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className={isNextLesson ? "bg-gradient-to-r from-indigo-600 to-purple-600" : ""}
                              onClick={() => {
                                if (lesson._id) {
                                  console.log("🔍 [CourseDetail] Navegando a lección:", lesson._id);
                                  navigate(`/curso/${id}/leccion/${lesson._id}`);
                                } else {
                                  console.log("🔍 [CourseDetail] Navegando a lección por índice:", i + 1);
                                  navigate(`/curso/${id}/leccion/${i + 1}`);
                                }
                              }}
                            >
                              {isNextLesson ? "▶️ Continuar" : "Ver lección"}
                            </Button>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400 px-3">
                            Inscríbete para acceder
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </div>
      )}

      {course.resources && course.resources.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <FaDownload className="text-indigo-600" />
            Recursos Adicionales
          </h2>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 space-y-2">
              {course.resources.map((resource, i) => (
                <a
                  key={i}
                  href={resource}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <FaDownload className="text-indigo-600 group-hover:text-indigo-700" />
                  <span className="text-blue-600 dark:text-blue-400 group-hover:underline flex-1 truncate">
                    {resource}
                  </span>
                  <FaExternalLinkAlt className="text-gray-400 text-xs" />
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Certificado si el curso está completado */}
      {isEnrolled && enrollment?.progress === 100 && enrollment?.completedAt && (
        <div className="mt-12">
          <Certificate 
            course={course}
            user={user}
            completedAt={enrollment.completedAt}
          />
        </div>
      )}

      {/* Sección de Reseñas */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          Reseñas y Calificaciones
        </h2>
        
        {/* Formulario de reseña (solo para estudiantes inscritos) */}
        {isEnrolled && user && !isOwner && (
          <div className="mb-8">
            <ReviewForm
              courseId={id}
              existingReview={null}
              onReviewSubmitted={() => {
                setRefreshReviews(prev => prev + 1);
              }}
            />
          </div>
        )}

        {/* Lista de reseñas */}
        <ReviewList
          courseId={id}
          onReviewUpdate={() => {
            setRefreshReviews(prev => prev + 1);
          }}
        />
      </div>

      {/* Notificaciones */}
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
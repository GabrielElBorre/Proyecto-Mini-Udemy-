import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Notification from "@/components/Notification";
import NotesPanel from "@/components/NotesPanel";
import QuestionsPanel from "@/components/QuestionsPanel";
import BookmarksPanel from "@/components/BookmarksPanel";
import API from "../api/api";
import useAuth from "@/hooks/useAuth";
import { FaPlay, FaPause } from "react-icons/fa";

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoTime, setVideoTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await API.get(`/courses/${courseId}`);
        setCourse(data.course);
        setEnrollment(data.enrollment);

        // Encontrar la lección actual
        const lessons = data.course.lessons || [];
        console.log("🔍 [LessonView] Buscando lección:", { lessonId, totalLessons: lessons.length });
        console.log("🔍 [LessonView] Lecciones disponibles:", lessons.map((l, i) => ({ 
          index: i, 
          _id: l._id?.toString(), 
          title: l.title 
        })));
        
        // Intentar encontrar por _id primero
        let lesson = lessons.find(l => l._id?.toString() === lessonId);
        
        // Si no se encuentra por _id, intentar por índice
        if (!lesson) {
          const lessonIndex = parseInt(lessonId) - 1;
          if (!isNaN(lessonIndex) && lessonIndex >= 0 && lessonIndex < lessons.length) {
            lesson = lessons[lessonIndex];
            console.log("✅ [LessonView] Lección encontrada por índice:", lessonIndex);
          }
        }
        
        // Si aún no se encuentra, intentar por orden
        if (!lesson) {
          lesson = lessons.find(l => l.order === parseInt(lessonId));
        }
        
        // Si aún no se encuentra, tomar la primera lección
        if (!lesson && lessons.length > 0) {
          console.warn("⚠️ [LessonView] Lección no encontrada, usando la primera lección");
          lesson = lessons.sort((a, b) => a.order - b.order)[0];
        }
        
        if (lesson) {
          console.log("✅ [LessonView] Lección encontrada:", lesson.title);
          setCurrentLesson(lesson);
        } else {
          console.error("❌ [LessonView] No hay lecciones disponibles en el curso");
          setError("Lección no encontrada. Este curso no tiene lecciones disponibles.");
        }
      } catch (err) {
        console.error("Error al cargar lección:", err);
        setError("Error al cargar la lección");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId, lessonId]);

  const isEnrolled = enrollment !== null;
  const lessons = course?.lessons || [];
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
  const currentIndex = sortedLessons.findIndex(
    (l) => l._id?.toString() === currentLesson?._id?.toString()
  );

  const nextLesson = currentIndex < sortedLessons.length - 1 
    ? sortedLessons[currentIndex + 1] 
    : null;
  const prevLesson = currentIndex > 0 
    ? sortedLessons[currentIndex - 1] 
    : null;

  // Calcular si la lección está completada (debe estar antes del useEffect que lo usa)
  const isCompleted = enrollment?.completedLessons?.some(
    id => id?.toString() === currentLesson?._id?.toString()
  ) || false;

  const markAsCompleted = useCallback(async () => {
    if (!enrollment || !currentLesson) {
      console.error("❌ [LessonView] No hay enrollment o currentLesson");
      return;
    }

    try {
      console.log("✅ [LessonView] Marcando lección como completada:", {
        enrollmentId: enrollment._id,
        lessonId: currentLesson._id,
        lessonTitle: currentLesson.title
      });

      const response = await API.put("/enrollments/progress", {
        enrollmentId: enrollment._id,
        lessonId: currentLesson._id,
      });
      
      console.log("✅ [LessonView] Progreso actualizado:", response.data);
      
      // Recargar datos del curso para obtener enrollment actualizado
      const { data } = await API.get(`/courses/${courseId}`);
      console.log("✅ [LessonView] Datos recargados, nuevo enrollment:", data.enrollment);
      
      setEnrollment(data.enrollment);
      setCourse(data.course);
      
      setNotification({ 
        message: `¡Lección "${currentLesson.title}" marcada como completada! ✓`, 
        type: "success" 
      });
    } catch (err) {
      console.error("❌ [LessonView] Error al marcar como completada:", err);
      const errorMsg = err.response?.data?.message || "Error al marcar lección como completada";
      setNotification({ message: errorMsg, type: "error" });
    }
  }, [enrollment, currentLesson, courseId]);

  // Auto-marcar como completada cuando el video termine (si es video HTML5)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enrollment || !currentLesson) return;

    // Calcular isCompleted dentro del useEffect para evitar problemas de orden
    const lessonIsCompleted = enrollment?.completedLessons?.some(
      id => id?.toString() === currentLesson?._id?.toString()
    ) || false;

    let hasMarkedAsCompleted = false; // Evitar múltiples llamadas

    const handleVideoEnd = () => {
      if (!lessonIsCompleted && !hasMarkedAsCompleted && enrollment && currentLesson) {
        console.log("🎬 [LessonView] Video terminado, marcando como completada automáticamente");
        hasMarkedAsCompleted = true;
        markAsCompleted();
      }
    };

    const handleTimeUpdate = () => {
      if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        setVideoProgress(progress);
        // Auto-marcar como completada si el usuario vio más del 90% del video
        if (progress >= 90 && !lessonIsCompleted && !hasMarkedAsCompleted && enrollment && currentLesson) {
          console.log("🎬 [LessonView] Video al 90%, marcando como completada automáticamente");
          hasMarkedAsCompleted = true;
          markAsCompleted();
        }
      }
    };

    video.addEventListener("ended", handleVideoEnd);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("ended", handleVideoEnd);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [currentLesson, enrollment, markAsCompleted]);

  function navigateToLesson(lesson) {
    const lessonIndex = sortedLessons.findIndex(l => l._id?.toString() === lesson._id?.toString());
    if (lesson._id) {
      navigate(`/curso/${courseId}/leccion/${lesson._id}`);
    } else {
      navigate(`/curso/${courseId}/leccion/${lessonIndex + 1}`);
    }
    window.scrollTo(0, 0);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-lg text-gray-600 dark:text-gray-400">Cargando lección...</p>
      </div>
    );
  }

  if (error || !currentLesson || !course) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-red-500 mb-4">{error || "Lección no encontrada"}</p>
          <Button onClick={() => navigate(`/curso/${courseId}`)}>
            Volver al curso
          </Button>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Debes estar inscrito en el curso para ver las lecciones
          </p>
          <Button onClick={() => navigate(`/curso/${courseId}`)}>
            Volver al curso
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/curso/${courseId}`)}
          className="mb-4"
        >
          ← Volver al curso
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {currentLesson.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {course.title} • Lección {currentIndex + 1} de {sortedLessons.length}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video o contenido */}
          {currentLesson.videoUrl ? (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                  {(() => {
                    const videoUrl = currentLesson.videoUrl;
                    console.log("🎥 [LessonView] Video URL:", videoUrl);
                    
                    // Detectar si es YouTube
                    const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
                    
                    if (isYouTube) {
                      // Convertir URL de YouTube a formato embed
                      let embedUrl = videoUrl;
                      
                      // Si es formato watch?v=, convertir a embed
                      if (videoUrl.includes("watch?v=")) {
                        const videoId = videoUrl.split("watch?v=")[1].split("&")[0];
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                      }
                      // Si es formato youtu.be/, convertir a embed
                      else if (videoUrl.includes("youtu.be/")) {
                        const videoId = videoUrl.split("youtu.be/")[1].split("?")[0];
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                      }
                      // Si ya es formato embed, usar directamente
                      else if (videoUrl.includes("youtube.com/embed/")) {
                        embedUrl = videoUrl;
                      }
                      // Si tiene /v/ en la URL
                      else if (videoUrl.includes("youtube.com/v/")) {
                        const videoId = videoUrl.split("youtube.com/v/")[1].split("?")[0];
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                      }
                      
                      console.log("🎥 [LessonView] YouTube embed URL:", embedUrl);
                      
                      return (
                        <iframe
                          src={embedUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          title={currentLesson.title}
                        />
                      );
                    } else {
                      // Video HTML5 normal
                      return (
                        <div className="relative">
                          <video
                            ref={videoRef}
                            src={videoUrl}
                            controls
                            className="w-full h-full"
                            onLoadedMetadata={() => {
                              if (videoRef.current) {
                                // Restaurar progreso si existe
                                const savedProgress = localStorage.getItem(`lesson-${currentLesson._id}-progress`);
                                if (savedProgress) {
                                  const time = parseFloat(savedProgress);
                                  videoRef.current.currentTime = time;
                                  setVideoTime(time);
                                }
                                // Aplicar velocidad guardada
                                const savedRate = localStorage.getItem(`lesson-${currentLesson._id}-rate`);
                                if (savedRate) {
                                  const rate = parseFloat(savedRate);
                                  videoRef.current.playbackRate = rate;
                                  setPlaybackRate(rate);
                                }
                              }
                            }}
                            onTimeUpdate={() => {
                              if (videoRef.current) {
                                const currentTime = videoRef.current.currentTime;
                                setVideoTime(currentTime);
                                localStorage.setItem(`lesson-${currentLesson._id}-progress`, currentTime);
                              }
                            }}
                          >
                            Tu navegador no soporta el elemento de video.
                          </video>
                          {/* Control de velocidad */}
                          <div className="absolute bottom-4 right-4 bg-black/70 rounded-lg p-2 flex items-center gap-2 z-10">
                            <span className="text-white text-sm">Velocidad:</span>
                            <select
                              value={playbackRate}
                              onChange={(e) => {
                                const rate = parseFloat(e.target.value);
                                setPlaybackRate(rate);
                                if (videoRef.current) {
                                  videoRef.current.playbackRate = rate;
                                  localStorage.setItem(`lesson-${currentLesson._id}-rate`, rate.toString());
                                }
                              }}
                              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-2 py-1 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="0.5">0.5x</option>
                              <option value="0.75">0.75x</option>
                              <option value="1">1x</option>
                              <option value="1.25">1.25x</option>
                              <option value="1.5">1.5x</option>
                              <option value="2">2x</option>
                            </select>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">📹</div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Esta lección no tiene video disponible
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Contacta al instructor para más información
                </p>
              </CardContent>
            </Card>
          )}

          {/* Descripción */}
          {currentLesson.description && (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Acerca de esta lección
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentLesson.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Navegación mejorada */}
          <div className="flex justify-between gap-4">
            {prevLesson ? (
              <Button
                variant="outline"
                onClick={() => navigateToLesson(prevLesson)}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <span>←</span>
                <div className="text-left">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Anterior</div>
                  <div className="font-medium">{prevLesson.title}</div>
                </div>
              </Button>
            ) : (
              <div className="flex-1" />
            )}
            
            {nextLesson ? (
              <Button
                onClick={() => navigateToLesson(nextLesson)}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2"
              >
                <div className="text-right">
                  <div className="text-xs opacity-90">Siguiente</div>
                  <div className="font-medium">{nextLesson.title}</div>
                </div>
                <span>→</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate(`/curso/${courseId}`)}
                className="flex-1"
              >
                ← Volver al curso
              </Button>
            )}
          </div>
          
          {/* Mensaje de finalización si es la última lección */}
          {!nextLesson && isCompleted && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 mt-4">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                  ¡Última lección completada!
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Has completado todas las lecciones de este curso. ¡Felicidades!
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => navigate(`/curso/${courseId}`)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600"
                  >
                    Ver Certificado
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                  >
                    Ir a Mi Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Paneles de Notas, Preguntas y Bookmarks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <NotesPanel 
              courseId={courseId} 
              lessonId={currentLesson?._id} 
              videoTime={videoTime}
            />
            <QuestionsPanel 
              courseId={courseId} 
              lessonId={currentLesson?._id}
            />
          </div>
          {currentLesson?._id && (
            <div className="mt-6">
              <BookmarksPanel
                courseId={courseId}
                lessonId={currentLesson._id}
                videoTime={videoTime}
                onSeek={(timestamp) => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = timestamp;
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Sidebar con lista de lecciones */}
        <div className="lg:col-span-1">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 sticky top-6">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                Lecciones del curso
              </h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {sortedLessons.map((lesson, index) => {
                  const isCurrent = lesson._id === currentLesson._id;
                  const isLessonCompleted = enrollment?.completedLessons?.some(
                    id => id === lesson._id || id.toString() === lesson._id?.toString()
                  );

                  return (
                    <button
                      key={lesson._id || index}
                      onClick={() => navigateToLesson(lesson)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        isCurrent
                          ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 font-semibold"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {index + 1}. {lesson.title}
                          </span>
                        </div>
                        {isLessonCompleted && (
                          <span className="text-green-600 dark:text-green-400">✓</span>
                        )}
                      </div>
                      {lesson.duration && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {lesson.duration} min
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Botón para marcar como completada */}
              {!isCompleted && enrollment && (
                <Button
                  onClick={markAsCompleted}
                  className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  variant="default"
                >
                  ✓ Marcar como completada
                </Button>
              )}
              {isCompleted && (
                <div className="w-full mt-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg text-center border-2 border-green-300 dark:border-green-700">
                  <span className="text-green-800 dark:text-green-200 font-semibold flex items-center justify-center gap-2">
                    <span className="text-xl">✓</span>
                    Lección completada
                  </span>
                </div>
              )}
              
              {/* Mostrar progreso del curso */}
              {enrollment && course && course.lessons && (
                <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Progreso del Curso</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {enrollment.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${enrollment.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {enrollment.completedLessons?.length || 0} de {course.lessons.length} lecciones
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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


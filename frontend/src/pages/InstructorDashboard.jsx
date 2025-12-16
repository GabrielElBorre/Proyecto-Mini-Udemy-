import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import NewCourseFormPro from "@/components/NewCourseFormPro";
import StudentList from "@/components/StudentList";
import InstructorStats from "@/components/InstructorStats";
import Notification from "@/components/Notification";
import ConfirmDialog from "@/components/ConfirmDialog";
import API from "../api/api";
import useAuth from "@/hooks/useAuth";

export default function InstructorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, courseId: null });
  const hasLoadedRef = useRef(false);
  const currentUserIdRef = useRef(null);

  useEffect(() => {
    if (!user || !user._id) {
      if (!user) {
        navigate("/login");
      }
      return;
    }

    // Si ya cargamos para este usuario, no volver a cargar
    if (hasLoadedRef.current && currentUserIdRef.current === user._id) {
      return;
    }

    let cancelled = false;
    
    async function loadCourses() {
      if (cancelled) return;
      
      try {
        setLoading(true);
        const { data } = await API.get("/courses/my-courses");
        if (!cancelled) {
          setCourses(data || []);
          setLoading(false);
          hasLoadedRef.current = true;
          currentUserIdRef.current = user._id;
        }
      } catch (err) {
        if (!cancelled) {
          setCourses([]);
          setLoading(false);
          if (err.response?.status === 401) {
            setNotification({ message: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", type: "warning" });
            setTimeout(() => navigate("/login"), 2000);
          }
        }
      }
    }
    
    loadCourses();
    
    return () => {
      cancelled = true;
    };
    // Solo ejecutar cuando cambie el ID del usuario, no cuando cambie el objeto completo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/courses/my-courses");
      setCourses(data || []);
    } catch (err) {
      setCourses([]);
      if (err.response?.status === 401) {
        setNotification({ message: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", type: "warning" });
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewCourse = async (data) => {
    try {
      setLoading(true);
      
      // Verificar que el usuario esté autenticado
      if (!user) {
        setNotification({ message: "Debes iniciar sesión para crear un curso ❌", type: "warning" });
        setLoading(false);
        setTimeout(() => navigate("/login"), 2000);
        return;
      }
      
      console.log("Datos recibidos del formulario:", data);
      
      // Validar campos requeridos
      if (!data.titulo || !data.titulo.trim()) {
        setNotification({ message: "El título del curso es requerido ❌", type: "error" });
        setLoading(false);
        return;
      }
      
      if (!data.descripcion || !data.descripcion.trim()) {
        setNotification({ message: "La descripción del curso es requerida ❌", type: "error" });
        setLoading(false);
        return;
      }
      
      if (data.descripcion.trim().length < 10) {
        setNotification({ message: "La descripción debe tener al menos 10 caracteres ❌", type: "error" });
        setLoading(false);
        return;
      }
      
      // Todos los cursos son gratis, establecer precio a 0
      const precio = 0;

      // Procesar recursos si vienen como string separado por comas
      let resources = [];
      if (data.recursos) {
        resources = data.recursos
          .split(",")
          .map((r) => r.trim())
          .filter((r) => r.length > 0);
      }

      // Validar y procesar lecciones (las lecciones son opcionales)
      const validLessons = (data.lecciones || [])
        .filter(lesson => lesson && lesson.title && lesson.title.trim() && lesson.videoUrl && lesson.videoUrl.trim())
        .map((lesson, index) => ({
          title: lesson.title.trim(),
          description: lesson.description?.trim() || "",
          videoUrl: lesson.videoUrl.trim(),
          duration: Number(lesson.duration) || 0,
          order: lesson.order || index + 1,
        }));

      const payload = {
        title: data.titulo.trim(),
        description: data.descripcion.trim(),
        price: precio, // Todos los cursos son gratis
        category: data.categoria || "Otros",
        imageUrl: data.imagenUrl || "https://placehold.co/600x400",
        lessons: validLessons,
        resources: resources,
      };
      
      console.log("Enviando payload al backend:", JSON.stringify(payload, null, 2));
      console.log("Token de autenticación:", localStorage.getItem("token") ? "Presente" : "Ausente");
      
      let response;
      if (editingCourse) {
        console.log("Actualizando curso:", editingCourse._id);
        response = await API.put(`/courses/${editingCourse._id}`, payload);
        console.log("Respuesta del servidor (actualizar):", response.data);
        setNotification({ message: "Curso actualizado con éxito 🚀", type: "success" });
      } else {
        console.log("Creando nuevo curso...");
        response = await API.post("/courses", payload);
        console.log("Respuesta del servidor (crear):", response.data);
        if (response.data && response.data.course) {
          setNotification({ message: "Curso creado con éxito 🚀", type: "success" });
        } else {
          setNotification({ message: "Curso creado pero no se recibió confirmación del servidor", type: "warning" });
        }
      }
      
      // Cerrar modal inmediatamente
      setOpenModal(false);
      setEditingCourse(null);
      
      // Recargar cursos inmediatamente
      hasLoadedRef.current = false; // Permitir recargar después de crear/editar
      await fetchCourses();
    } catch (err) {
      console.error("Error completo al guardar curso:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);
      
      let errorMessage = "Error al guardar curso ❌";
      
      if (err.response?.data?.errors) {
        // Errores de validación del backend
        const validationErrors = err.response.data.errors.map(e => e.msg).join(", ");
        errorMessage = `Errores de validación: ${validationErrors}`;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      if (err.response?.status === 401) {
        errorMessage = "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
        localStorage.removeItem("token");
        navigate("/login");
      }
      
      setNotification({ message: errorMessage, type: "error" });
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setOpenModal(true);
  };

  const handleDelete = (courseId) => {
    setConfirmDialog({
      isOpen: true,
      courseId,
      title: "Eliminar Curso",
      message: "¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      type: "danger"
    });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.courseId) return;

    try {
      setLoading(true);
      await API.delete(`/courses/${confirmDialog.courseId}`);
      setNotification({ message: "Curso eliminado exitosamente ✓", type: "success" });
      hasLoadedRef.current = false; // Permitir recargar después de eliminar
      await fetchCourses();
    } catch (err) {
      console.error("Error al eliminar curso:", err);
      setNotification({ message: "Error al eliminar curso ❌", type: "error" });
      setLoading(false);
    }
  };

  const handlePublish = async (course) => {
    try {
      setLoading(true);
      await API.put(`/courses/${course._id}`, {
        isPublished: !course.isPublished,
      });
      setNotification({ 
        message: course.isPublished ? "Curso despublicado exitosamente ✓" : "Curso publicado exitosamente ✓", 
        type: "success" 
      });
      hasLoadedRef.current = false; // Permitir recargar después de publicar/despublicar
      await fetchCourses();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setNotification({ message: "Error al cambiar estado del curso ❌", type: "error" });
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-lg text-gray-600 dark:text-gray-400">Cargando tus cursos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Cursos Creados 🎓</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Gestiona los cursos que has creado ({courses.length} curso{courses.length !== 1 ? 's' : ''})
          </p>
        </div>
        <Button onClick={() => {
          setEditingCourse(null);
          setOpenModal(true);
        }}>
          + Crear nuevo curso
        </Button>
      </div>

      {/* Estadísticas del instructor */}
      {courses.length > 0 && <InstructorStats courses={courses} />}

      {courses.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-8 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              Aún no has creado ningún curso
            </p>
            <Button onClick={() => setOpenModal(true)}>
              Crear tu primer curso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <Card 
              key={course._id} 
              className="hover:shadow-lg transition bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Información del curso */}
                  <div className="lg:col-span-1">
                    <img
                      src={course.imageUrl || "https://placehold.co/400x200"}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      {course.title}
                    </h2>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                        {typeof course.category === 'object' && course.category !== null
                          ? course.category.name || course.category
                          : course.category || "Sin categoría"}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {course.price === 0 ? "Gratis" : `$${course.price}`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {course.students?.length || course.enrollmentCount || 0} estudiante{(course.students?.length || course.enrollmentCount || 0) !== 1 ? 's' : ''}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        course.isPublished 
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
                          : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                      }`}>
                        {course.isPublished ? "Publicado" : "Borrador"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setSelectedCourseForStudents(course._id)}
                        className="w-full"
                      >
                        👥 Ver Estudiantes ({course.students?.length || course.enrollmentCount || 0})
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(course)}
                          className="flex-1"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePublish(course)}
                          className="flex-1"
                        >
                          {course.isPublished ? "Despublicar" : "Publicar"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(course._id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Lista de estudiantes directamente visible */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        👥 Estudiantes Inscritos
                      </h3>
                      {(course.students?.length || course.enrollmentCount || 0) > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCourseForStudents(course._id)}
                        >
                          Ver Detalles Completos
                        </Button>
                      )}
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50 min-h-[200px]">
                      {course._id ? (
                        <StudentList
                          key={`student-list-${course._id}`} // Key estable para evitar re-renders innecesarios
                          courseId={course._id}
                          onClose={() => {}}
                          compact={true}
                        />
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          Cargando información del curso...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto mx-4">
            <button
              className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
              onClick={() => {
                setOpenModal(false);
                setEditingCourse(null);
              }}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingCourse ? "Editar curso" : "Crear nuevo curso"}
            </h2>
            <NewCourseFormPro 
              onSubmit={handleNewCourse} 
              initialData={editingCourse}
            />
          </div>
        </div>
      )}

      {/* Modal de estudiantes */}
      {selectedCourseForStudents && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto mx-4">
            <button
              className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
              onClick={() => setSelectedCourseForStudents(null)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Estudiantes Inscritos
            </h2>
            <StudentList
              courseId={selectedCourseForStudents}
              onClose={() => setSelectedCourseForStudents(null)}
            />
          </div>
        </div>
      )}

      {/* Notificaciones */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={3000}
        />
      )}

      {/* Dialog de confirmación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, courseId: null })}
        onConfirm={confirmDelete}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        type={confirmDialog.type}
      />
    </div>
  );
}
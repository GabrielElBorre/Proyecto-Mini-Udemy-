import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import API from "../api/api";
import Rating from "./Rating";

export default function StudentList({ courseId, onClose, compact = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    let cancelled = false;
    
    async function fetchStudents() {
      if (cancelled) return;
      
      try {
        const { data } = await API.get(`/courses/${courseId}/students`);
        
        if (isMounted && !cancelled) {
          setData(data);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        if (!isMounted || cancelled) return;
        
        const errorMsg = err.response?.data?.message || err.message || "Error al cargar estudiantes";
        setError(errorMsg);
        setLoading(false);
      }
    }
    
    setLoading(true);
    setData(null);
    setError("");
    fetchStudents();
    
    return () => {
      isMounted = false;
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  if (loading && !data) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
        <p className="text-gray-600 dark:text-gray-400">Cargando estudiantes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 dark:text-red-400 mb-2">{error}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Verifica que tengas permisos para ver los estudiantes de este curso
        </p>
        {!compact && onClose && (
          <Button onClick={onClose} variant="outline" className="mt-4">
            Cerrar
          </Button>
        )}
      </div>
    );
  }

  if (!data || data.students.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <div className="text-4xl mb-2">👥</div>
        <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">
          Aún no hay estudiantes inscritos en este curso
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Los estudiantes aparecerán aquí cuando se inscriban
        </p>
        {!compact && onClose && (
          <Button onClick={onClose} variant="outline" className="mt-4">
            Cerrar
          </Button>
        )}
      </div>
    );
  }

  const { students, totalStudents, completedStudents, course } = data;

  return (
    <div className="space-y-4">
      {/* Estadísticas */}
      {!compact && (
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm opacity-90">Total Estudiantes</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Completados</p>
                <p className="text-2xl font-bold">{completedStudents}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">En Progreso</p>
                <p className="text-2xl font-bold">{totalStudents - completedStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas compactas */}
      {compact && (
        <div className="flex gap-4 mb-4">
          <div className="flex-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{totalStudents}</p>
          </div>
          <div className="flex-1 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">Completados</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{completedStudents}</p>
          </div>
          <div className="flex-1 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">En Progreso</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{totalStudents - completedStudents}</p>
          </div>
        </div>
      )}

      {/* Lista de estudiantes */}
      <div className={`space-y-3 ${compact ? 'max-h-[400px]' : 'max-h-[600px]'} overflow-y-auto`}>
        {students.map((studentData) => (
          <Card
            key={studentData.enrollmentId}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Foto del estudiante */}
                <img
                  src={studentData.student.photoUrl || "https://placehold.co/60x60"}
                  alt={studentData.student.name}
                  className="w-16 h-16 rounded-full object-cover"
                />

                {/* Información del estudiante */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {studentData.student.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {studentData.student.email}
                      </p>
                    </div>
                    {studentData.isCompleted && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-semibold">
                        ✓ Completado
                      </span>
                    )}
                  </div>

                  {/* Progreso */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">Progreso</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {studentData.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${studentData.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {studentData.completedLessons} de {studentData.totalLessons} lecciones completadas
                    </p>
                  </div>

                  {/* Fechas */}
                  <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span>
                      Inscrito: {new Date(studentData.enrolledAt).toLocaleDateString("es-ES")}
                    </span>
                    {studentData.completedAt && (
                      <span>
                        Completado: {new Date(studentData.completedAt).toLocaleDateString("es-ES")}
                      </span>
                    )}
                  </div>

                  {/* Reseña */}
                  {studentData.review ? (
                    <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          Reseña:
                        </span>
                        <Rating rating={studentData.review.rating} />
                      </div>
                      {studentData.review.comment && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          "{studentData.review.comment}"
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(studentData.review.createdAt).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Sin reseña aún
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!compact && onClose && (
        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      )}
    </div>
  );
}


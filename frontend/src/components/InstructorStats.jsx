import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import API from "../api/api";

export default function InstructorStats({ courses }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [courses]);

  async function fetchStats() {
    try {
      // Calcular estadísticas de todos los cursos
      let totalStudents = 0;
      let totalCompleted = 0;
      let totalRevenue = 0;
      let coursesWithStudents = 0;

      for (const course of courses) {
        try {
          const { data } = await API.get(`/courses/${course._id}/students`);
          totalStudents += data.totalStudents || 0;
          totalCompleted += data.completedStudents || 0;
          totalRevenue += (data.totalStudents || 0) * (course.price || 0);
          if (data.totalStudents > 0) coursesWithStudents++;
        } catch (err) {
          // Ignorar errores de cursos sin estudiantes
        }
      }

      setStats({
        totalStudents,
        totalCompleted,
        totalRevenue,
        coursesWithStudents,
        totalCourses: courses.length,
        completionRate: totalStudents > 0 ? Math.round((totalCompleted / totalStudents) * 100) : 0,
      });
    } catch (err) {
      console.error("Error al calcular estadísticas:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600 dark:text-gray-400">Cargando estadísticas...</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
        <CardContent className="p-4">
          <p className="text-sm opacity-90 mb-1">Total Estudiantes</p>
          <p className="text-3xl font-bold">{stats.totalStudents}</p>
          <p className="text-xs opacity-75 mt-1">
            En {stats.coursesWithStudents} curso{stats.coursesWithStudents !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
        <CardContent className="p-4">
          <p className="text-sm opacity-90 mb-1">Cursos Completados</p>
          <p className="text-3xl font-bold">{stats.totalCompleted}</p>
          <p className="text-xs opacity-75 mt-1">
            {stats.completionRate}% tasa de finalización
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
        <CardContent className="p-4">
          <p className="text-sm opacity-90 mb-1">Total Cursos</p>
          <p className="text-3xl font-bold">{stats.totalCourses}</p>
          <p className="text-xs opacity-75 mt-1">
            {stats.coursesWithStudents} con estudiantes
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
        <CardContent className="p-4">
          <p className="text-sm opacity-90 mb-1">Ingresos Potenciales</p>
          <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">
            MXN
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



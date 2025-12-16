import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import API from "../api/api";
import { FaChartLine, FaChartBar, FaChartPie } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdvancedAnalytics() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30"); // días

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      const { data } = await API.get("/enrollments/my-courses");
      setEnrollments(data || []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Preparar datos para gráficos
  const prepareProgressTimeline = () => {
    const days = parseInt(timeRange);
    const dates = [];
    const progressData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString("es-ES", { month: "short", day: "numeric" }));
      
      // Calcular progreso promedio para ese día
      const dayProgress = enrollments
        .filter(e => {
          const enrolledDate = new Date(e.enrolledAt);
          return enrolledDate <= date;
        })
        .reduce((sum, e) => sum + (e.progress || 0), 0);
      
      const count = enrollments.filter(e => {
        const enrolledDate = new Date(e.enrolledAt);
        return enrolledDate <= date;
      }).length;
      
      progressData.push(count > 0 ? Math.round(dayProgress / count) : 0);
    }
    
    return { dates, progressData };
  };

  const prepareCourseComparison = () => {
    const courses = enrollments.slice(0, 5).map(e => ({
      name: e.course?.title?.substring(0, 20) + (e.course?.title?.length > 20 ? "..." : "") || "Curso",
      progress: e.progress || 0
    }));
    
    return {
      labels: courses.map(c => c.name),
      data: courses.map(c => c.progress)
    };
  };

  const prepareCompletionDistribution = () => {
    const completed = enrollments.filter(e => e.progress === 100).length;
    const inProgress = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
    const notStarted = enrollments.filter(e => e.progress === 0).length;
    
    return {
      labels: ["Completados", "En Progreso", "No Iniciados"],
      data: [completed, inProgress, notStarted],
      colors: ["#10b981", "#f59e0b", "#ef4444"]
    };
  };

  const timelineData = prepareProgressTimeline();
  const comparisonData = prepareCourseComparison();
  const distributionData = prepareCompletionDistribution();

  const progressChartData = {
    labels: timelineData.dates,
    datasets: [
      {
        label: "Progreso Promedio (%)",
        data: timelineData.progressData,
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const comparisonChartData = {
    labels: comparisonData.labels,
    datasets: [
      {
        label: "Progreso (%)",
        data: comparisonData.data,
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(34, 197, 94, 0.8)"
        ],
        borderRadius: 8
      }
    ]
  };

  const distributionChartData = {
    labels: distributionData.labels,
    datasets: [
      {
        data: distributionData.data,
        backgroundColor: distributionData.colors,
        borderWidth: 2,
        borderColor: "#fff"
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#6b7280",
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 12
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: "#6b7280"
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)"
        }
      },
      x: {
        ticks: {
          color: "#6b7280"
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)"
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            📊 Analytics Avanzados
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Visualiza tu progreso y rendimiento
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Progreso Temporal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <FaChartLine className="text-indigo-600" />
                Progreso Temporal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line data={progressChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Comparativa de Cursos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <FaChartBar className="text-purple-600" />
                Comparativa de Cursos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar data={comparisonChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Distribución de Completación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <FaChartPie className="text-green-600" />
                Distribución de Completación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="w-64">
                  <Doughnut 
                    data={distributionChartData} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          ...chartOptions.plugins.legend,
                          position: "right"
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}


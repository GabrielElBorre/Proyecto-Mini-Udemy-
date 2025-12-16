import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ThemeToggle from "@/components/ThemeToggle";
import ProtectedRoute from "@/components/ProtectedRoute";
import AIChatbot from "@/components/AIChatbot";
import Home from "@/pages/Home";
import CourseDetail from "@/pages/CourseDetail";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import StudentDashboard from "@/pages/StudentDashboard";
import InstructorDashboard from "@/pages/InstructorDashboard";
import Profile from "@/pages/Profile";
import AI from "@/pages/AI";
import LessonView from "@/pages/LessonView";
import AchievementsPage from "@/pages/AchievementsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import TimelinePage from "@/pages/TimelinePage";
import FavoritesPage from "@/pages/FavoritesPage";
import FollowingPage from "@/pages/FollowingPage";

export default function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Navbar siempre visible */}
      <Navbar />

      {/* Contenido con rutas */}
      <div className="max-w-7xl mx-auto mt-6 p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/curso/:id" element={<CourseDetail />} />
          <Route path="/curso/:courseId/leccion/:lessonId" element={<LessonView />} />
          <Route path="/ai" element={<AI />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireAuth={true}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor"
            element={
              <ProtectedRoute requireAuth={true}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requireAuth={true}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute requireAuth={true}>
                <AchievementsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute requireAuth={true}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timeline"
            element={
              <ProtectedRoute requireAuth={true}>
                <TimelinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute requireAuth={true}>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/following"
            element={
              <ProtectedRoute requireAuth={true}>
                <FollowingPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* Botón flotante para cambiar tema */}
      <ThemeToggle />
      
      {/* Chatbot de IA - Disponible en todas las páginas */}
      <AIChatbot />
    </div>
  );
}
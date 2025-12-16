import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

export default function ProtectedRoute({ children, requireAuth = true, requireRole = null }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}



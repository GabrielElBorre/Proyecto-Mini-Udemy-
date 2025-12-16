import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import API from "../api/api";
import useAuth from "@/hooks/useAuth";
import CourseCard from "@/components/CourseCard";
import { FaHeart, FaBook } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data } = await API.get("/favorites");
      setFavorites(data.favorites || []);
    } catch (err) {
      console.error("Error al cargar favoritos:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Debes iniciar sesión para ver tus favoritos
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
            ❤️ Mis Favoritos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cursos guardados para ver después ({favorites.length})
          </p>
        </div>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <FaBook className="text-sm" />
            Explorar Cursos
          </Button>
        </Link>
      </div>

      {favorites.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-12 text-center">
            <FaHeart className="text-6xl mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No tienes favoritos aún
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Agrega cursos a tus favoritos haciendo clic en el corazón ❤️
            </p>
            <Link to="/">
              <Button>
                Explorar Cursos
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites
            .filter(favorite => favorite.course) // Filtrar favoritos sin curso
            .map((favorite, index) => (
              <motion.div
                key={favorite._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CourseCard curso={favorite.course} />
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Rating from "@/components/Rating";

export default function CourseCard({ curso }) {
  const navigate = useNavigate();
  
  // Validar que curso existe
  if (!curso) {
    console.error("❌ [CourseCard] Curso es undefined o null");
    return null;
  }
  
  // Compatibilidad con datos del backend
  const title = curso.title || curso.titulo || "Sin título";
  const defaultImage = "https://placehold.co/400x200/6366f1/ffffff?text=Curso";
  const [imageUrl, setImageUrl] = useState(curso.imageUrl || curso.imagen || defaultImage);
  const instructorName = curso.instructor?.name || curso.profesor || "Instructor";
  const price = curso.price || curso.precio || 0;
  const rating = curso.rating || 0;
  const courseId = curso._id || curso.id;

  // Debug: verificar que el curso tenga ID
  if (!courseId) {
    console.error("❌ [CourseCard] Curso sin ID:", curso);
  }

  const handleImageError = () => {
    setImageUrl(defaultImage);
  };

  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (courseId) {
      console.log("🖱️ Click en curso, navegando a:", `/curso/${courseId}`);
      navigate(`/curso/${courseId}`);
    } else {
      console.error("❌ No hay courseId:", curso);
    }
  };

  // Manejar categoría como objeto o string (compatibilidad)
  const category = typeof curso.category === 'object' && curso.category !== null
    ? curso.category.name || curso.category
    : curso.category || curso.categoria || "";
  const categoryIcon = typeof curso.category === 'object' && curso.category !== null
    ? curso.category.icon || ""
    : "";
  const categoryColor = typeof curso.category === 'object' && curso.category !== null
    ? curso.category.color || "#6366f1"
    : "#6366f1";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ scale: 1.02 }}
      onClick={handleCardClick}
      className="h-full cursor-pointer"
    >
      <Card 
        className="hover:shadow-xl transition cursor-pointer p-2 h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        onClick={handleCardClick}
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-40 object-cover rounded-md"
          onError={handleImageError}
        />

        <CardHeader className="p-2">
          <CardTitle className="text-lg font-semibold line-clamp-2 text-gray-900 dark:text-white">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-2">
          <p className="text-gray-600 dark:text-gray-400 text-sm">{instructorName}</p>
          
          {category && (
            <span 
              className="inline-block px-2 py-1 rounded text-xs font-semibold mt-1"
              style={{
                backgroundColor: `${categoryColor}20`,
                color: categoryColor,
                border: `1px solid ${categoryColor}40`
              }}
            >
              {categoryIcon && <span className="mr-1">{categoryIcon}</span>}
              {category}
            </span>
          )}

          <div className="flex items-center gap-2 my-2">
            {rating > 0 ? (
              <>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{rating.toFixed(1)}</span>
                <Rating rating={rating} />
              </>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">Sin calificaciones</span>
            )}
          </div>

          {price === 0 ? (
            <p className="text-green-600 dark:text-green-400 font-bold text-lg">Gratis</p>
          ) : (
            <p className="text-purple-700 dark:text-purple-400 font-bold text-lg">${price} MXN</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import CourseCard from "@/components/CourseCard";
import CategoryChips from "@/components/CategoryChips";
import Hero from "@/components/Hero";
import PopularCourses from "@/components/PopularCourses";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import API from "../api/api";

const categorias = ["Todos", "Desarrollo", "Diseño", "Negocios", "Marketing", "Otros"];
const COURSES_PER_PAGE = 20;
const sortOptions = [
  { value: "newest", label: "Más recientes" },
  { value: "oldest", label: "Más antiguos" },
  { value: "price-low", label: "Precio: Menor a Mayor" },
  { value: "price-high", label: "Precio: Mayor a Menor" },
  { value: "rating", label: "Mejor calificados" },
  { value: "popular", label: "Más populares" },
];

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [courses, setCourses] = useState([]);
  const [displayedCourses, setDisplayedCourses] = useState(COURSES_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  // Obtener query de búsqueda y categoría de la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search");
    const categoryParam = params.get("category");
    
    if (searchParam) {
      setBusqueda(searchParam);
    } else {
      setBusqueda("");
    }
    
    if (categoryParam && categorias.includes(categoryParam)) {
      setCategoriaSeleccionada(categoryParam);
    } else {
      setCategoriaSeleccionada("Todos");
    }
  }, [location.search]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (busqueda.trim()) {
          params.set("search", busqueda.trim());
        }
        if (categoriaSeleccionada !== "Todos") {
          params.set("category", categoriaSeleccionada);
        }
        const { data } = await API.get(`/courses?${params.toString()}`);
        console.log("📚 [Home] Cursos recibidos:", data);
        console.log("📚 [Home] Cantidad de cursos:", data?.length || 0);
        if (data && data.length > 0) {
          console.log("📚 [Home] Primer curso:", data[0]);
          console.log("📚 [Home] Primer curso _id:", data[0]._id);
        }
        setCourses(data || []);
        setDisplayedCourses(COURSES_PER_PAGE); // Resetear a 20 cuando cambian los filtros
      } catch (err) {
        console.error("❌ [Home] Error al cargar cursos:", err);
        
        if (err.isRateLimit || err.response?.status === 429) {
          console.warn("⚠️ [Home] Rate limit (429) alcanzado, reintentando en 3 segundos...");
          // Reintentar después de 3 segundos
          setTimeout(() => {
            fetchCourses();
          }, 3000);
          return;
        }
        
        console.error("❌ [Home] Error completo:", err.response?.data || err.message);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [busqueda, categoriaSeleccionada]);

  // Ordenar cursos
  const sortedCourses = [...courses].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "popular":
        return (b.ratingCount || 0) - (a.ratingCount || 0);
      default:
        return 0;
    }
  });

  const cursosMostrados = sortedCourses.slice(0, displayedCourses);
  const hayMasCursos = sortedCourses.length > displayedCourses;

  const handleLoadMore = () => {
    setDisplayedCourses(prev => prev + COURSES_PER_PAGE);
  };

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      <Hero />
      <div className="flex flex-col md:flex-row gap-4 mb-6 mt-8 md:mt-12">
        <div className="flex-1">
          <CategoryChips
            categorias={categorias}
            selected={categoriaSeleccionada}
            onSelect={(cat) => {
              setCategoriaSeleccionada(cat);
              const params = new URLSearchParams(location.search);
              if (cat === "Todos") {
                params.delete("category");
              } else {
                params.set("category", cat);
              }
              const newUrl = params.toString() 
                ? `/?${params.toString()}` 
                : "/";
              navigate(newUrl, { replace: true });
            }}
          />
        </div>
        <div className="md:w-64">
          <Label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-300">
            Ordenar por:
          </Label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div id="cursos-section">
      {loading ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 dark:text-gray-400">Cargando cursos...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 dark:text-gray-400">No se encontraron cursos con los filtros seleccionados.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              Mostrando <span className="font-semibold">{cursosMostrados.length}</span> de <span className="font-semibold">{sortedCourses.length}</span> curso{sortedCourses.length !== 1 ? 's' : ''}
            </p>
            {sortedCourses.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ordenado por: {sortOptions.find(o => o.value === sortBy)?.label}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cursosMostrados.map((curso) => (
              <CourseCard key={curso._id} curso={curso} />
            ))}
          </div>
          {hayMasCursos && (
            <div className="text-center mt-8">
              <Button 
                onClick={handleLoadMore}
                variant="outline"
                className="px-8 py-2"
              >
                Cargar más cursos ({courses.length - displayedCourses} restantes)
              </Button>
            </div>
          )}
        </>
      )}
      </div>
      <PopularCourses />
      <Testimonials />
      <Footer />
    </div>
  );
}
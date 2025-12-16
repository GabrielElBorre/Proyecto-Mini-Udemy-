import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import CourseCard from "@/components/CourseCard";
import API from "../api/api";

export default function PopularCourses() {
  const [popularCourses, setPopularCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopularCourses() {
      try {
        setLoading(true);
        const { data } = await API.get("/courses");
        
        // Ordenar por rating y ratingCount, tomar los top 8
        const sorted = [...(data || [])]
          .filter(course => course.isPublished !== false)
          .sort((a, b) => {
            // Primero por rating (si tienen rating)
            if (a.rating > 0 && b.rating > 0) {
              if (b.rating !== a.rating) {
                return b.rating - a.rating;
              }
            }
            // Si tienen el mismo rating o no tienen, ordenar por cantidad de reseñas
            return (b.ratingCount || 0) - (a.ratingCount || 0);
          })
          .slice(0, 8); // Top 8 cursos populares
        
        setPopularCourses(sorted);
      } catch (err) {
        console.error("❌ [PopularCourses] Error al cargar cursos:", err);
        
        if (err.isRateLimit) {
          console.warn("⚠️ [PopularCourses] Rate limit alcanzado, reintentando...");
          setTimeout(() => {
            fetchPopularCourses();
          }, 2000);
          return;
        }
        
        setPopularCourses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPopularCourses();
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <h2 className="text-2xl font-bold text-center mb-8">Cursos populares ⭐</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Cargando cursos populares...</p>
        </div>
      </section>
    );
  }

  if (popularCourses.length === 0) {
    return null; // No mostrar si no hay cursos
  }

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Cursos populares ⭐
      </h2>
      <div className="max-w-7xl mx-auto px-4">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="pb-12"
        >
          {popularCourses.map((curso) => (
            <SwiperSlide key={curso._id}>
              <CourseCard curso={curso} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import { FaStar, FaQuoteLeft } from "react-icons/fa";

const testimonios = [
  {
    nombre: "Ana Torres",
    rol: "Frontend Developer",
    mensaje:
      "MiniUdemy me ayudó a conseguir mi primer trabajo en tecnología. Los cursos son claros, prácticos y los instructores realmente saben de lo que hablan. ¡100% recomendado!",
    empresa: "TechCorp",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    nombre: "Carlos Méndez",
    rol: "UX Designer",
    mensaje:
      "Gracias a MiniUdemy mejoré mis habilidades de diseño y ahora lidero proyectos de experiencia de usuario. El contenido es de calidad profesional y muy actualizado.",
    empresa: "DesignHub",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    nombre: "Lucía Ramírez",
    rol: "Data Analyst",
    mensaje:
      "Los cursos de IA me dieron las bases para entrar en el mundo del análisis de datos. La plataforma es intuitiva y el soporte es excelente. ¡Superé mis expectativas!",
    empresa: "DataWorks",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=9",
  },
  {
    nombre: "Roberto Sánchez",
    rol: "Full Stack Developer",
    mensaje:
      "He tomado varios cursos aquí y todos han sido increíbles. La estructura de los cursos es perfecta, desde lo básico hasta lo avanzado. Definitivamente volveré por más.",
    empresa: "StartupTech",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=33",
  },
  {
    nombre: "María González",
    rol: "Product Manager",
    mensaje:
      "Como Product Manager, necesitaba entender mejor el desarrollo. Los cursos de MiniUdemy me dieron esa perspectiva técnica que necesitaba. Muy bien explicado todo.",
    empresa: "InnovateLab",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    nombre: "Diego Fernández",
    rol: "Backend Developer",
    mensaje:
      "Los cursos de Node.js y MongoDB son excelentes. Aprendí mucho y pude aplicar directamente lo aprendido en mi trabajo. El precio es muy accesible para la calidad que ofrecen.",
    empresa: "CloudSystems",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=20",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título mejorado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Mira lo que dicen nuestros estudiantes
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Miles de estudiantes han transformado sus carreras con nuestros cursos
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className="text-yellow-400 text-xl" />
            ))}
            <span className="ml-2 text-gray-700 dark:text-gray-300 font-semibold">
              4.9/5 de más de 2,500 reseñas
            </span>
          </div>
        </motion.div>

        {/* Swiper mejorado */}
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ 
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-16"
        >
          {testimonios.map((testimonio, i) => (
            <SwiperSlide key={i}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="h-full"
              >
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-100 dark:border-gray-700">
                  {/* Icono de comillas */}
                  <div className="mb-4">
                    <FaQuoteLeft className="text-indigo-500 text-3xl opacity-20" />
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonio.rating)].map((_, idx) => (
                      <FaStar key={idx} className="text-yellow-400 text-sm" />
                    ))}
                  </div>

                  {/* Mensaje */}
                  <p className="text-gray-700 dark:text-gray-300 mb-6 flex-grow text-lg leading-relaxed">
                    "{testimonio.mensaje}"
                  </p>

                  {/* Información del estudiante */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <img
                      src={testimonio.avatar}
                      alt={testimonio.nombre}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-900"
                    />
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {testimonio.nombre}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonio.rol}
                      </div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        {testimonio.empresa}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Sección de empresas líderes mejorada */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-24"
        >
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl p-12 border border-indigo-100 dark:border-gray-700 shadow-xl">
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", delay: 0.4 }}
                className="inline-block mb-4"
              >
                <div className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  💼 Trusted by Industry Leaders
                </div>
              </motion.div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Nuestros estudiantes trabajan en empresas líderes
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Más de 5,000 profesionales confían en nosotros para avanzar en sus carreras
              </p>
            </div>

            {/* Grid de logos con animaciones */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
              {[
                { 
                  name: "Amazon", 
                  logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
                  color: "from-orange-500 to-orange-600"
                },
                { 
                  name: "Microsoft", 
                  logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
                  color: "from-blue-500 to-blue-600"
                },
                { 
                  name: "Google", 
                  logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google.png",
                  color: "from-red-500 via-yellow-500 to-green-500"
                },
                { 
                  name: "Spotify", 
                  logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
                  color: "from-green-500 to-green-600"
                },
                { 
                  name: "Meta", 
                  logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
                  color: "from-blue-600 to-blue-700"
                },
              ].map((company, index) => (
                <motion.div
                  key={company.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="flex items-center justify-center"
                >
                  <div className="group relative">
                    {/* Fondo con gradiente al hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${company.color} rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}></div>
                    
                    {/* Contenedor del logo */}
                    <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md group-hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group-hover:border-indigo-300 dark:group-hover:border-indigo-600">
                      <img 
                        src={company.logo} 
                        alt={company.name} 
                        className="h-10 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 dark:invert dark:group-hover:invert-0"
                      />
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1 rounded whitespace-nowrap">
                        {company.name}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Estadísticas adicionales */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">5,000+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Estudiantes activos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">98%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tasa de satisfacción</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">500+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Empresas asociadas</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
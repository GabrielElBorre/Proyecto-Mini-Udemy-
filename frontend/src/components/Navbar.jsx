import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSearch, FaUser, FaSignOutAlt, FaChalkboardTeacher, FaUserCircle, FaBars, FaTimes, FaBookOpen, FaHeart, FaUserPlus } from "react-icons/fa";
import API from "../api/api";
import useAuth from "@/hooks/useAuth";

const categorias = ["Todos", "Desarrollo", "Diseño", "Negocios", "Marketing", "Otros"];

export default function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const searchContainerRef = useRef(null);
  const categoryRef = useRef(null);

  // Obtener query de búsqueda y categoría de la URL si existe
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search");
    const category = params.get("category");
    if (query) {
      setSearchQuery(query);
    }
    if (category && categorias.includes(category)) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory("Todos");
    }
  }, [location.search]);

  // Buscar cursos mientras el usuario escribe
  useEffect(() => {
    const searchCourses = async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const { data } = await API.get("/courses", {
            params: { search: searchQuery.trim() }
          });
          setSearchResults(data.slice(0, 5)); // Mostrar máximo 5 resultados
          setShowResults(true);
        } catch (err) {
          console.error("Error al buscar cursos:", err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    };

    const timeoutId = setTimeout(searchCourses, 300); // Debounce de 300ms
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }

    if (openMenu || showResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu, showResults]);

  function handleSearch(e) {
    e.preventDefault();
    setShowResults(false);
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    const queryString = params.toString();
    navigate(queryString ? `/?${queryString}` : "/");
    // Scroll a la sección de cursos después de navegar
    setTimeout(() => {
      const section = document.getElementById("cursos-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }

  function handleCourseClick(courseId) {
    setShowResults(false);
    setSearchQuery("");
    navigate(`/curso/${courseId}`);
  }

  async function handleLogout() {
    try {
      // Cerrar sesión en el servidor
      await API.post("/sessions/logout");
    } catch (err) {
      console.error("Error al cerrar sesión en servidor:", err);
      // Continuar con el logout local aunque falle el servidor
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setOpenMenu(false);
      window.location.href = "/"; // redirige al home
    }
  }

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700"
          : "bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800"
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xl shadow-lg">
                MiniUdemy
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Buscador con resultados */}
        <div className="flex-1 w-full md:max-w-2xl md:mx-4 flex gap-2">
          {/* Buscador */}
          <div ref={searchContainerRef} className="flex-1 relative">
            <form onSubmit={handleSearch}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <Input
                      ref={searchRef}
                      type="text"
                      placeholder="Buscar cursos..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowResults(true);
                      }}
                      onFocus={() => {
                        if (searchResults.length > 0) {
                          setShowResults(true);
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-lg"
                    />
                  </div>
                {/* Dropdown de resultados */}
                <AnimatePresence>
                  {showResults && searchQuery.trim().length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto backdrop-blur-sm"
                    >
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Buscando...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                            {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        {searchResults.map((course) => (
                          <button
                            key={course._id}
                            onClick={() => handleCourseClick(course._id)}
                            className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition"
                          >
                            <div className="flex gap-3">
                              <img
                                src={course.imageUrl || "https://placehold.co/80x60"}
                                alt={course.title}
                                className="w-20 h-14 object-cover rounded"
                                onError={(e) => {
                                  e.target.src = "https://placehold.co/80x60/6366f1/ffffff?text=Curso";
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm truncate text-gray-900 dark:text-white">{course.title}</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  {course.instructor?.name || "Instructor"}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                    ${course.price}
                                  </span>
                                  {course.rating > 0 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      ⭐ {course.rating.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                        {searchQuery.trim() && (
                          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={handleSearch}
                              className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold py-2"
                            >
                              Ver todos los resultados para "{searchQuery}"
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron cursos
                      </div>
                    )}
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <FaSearch />
                  <span className="hidden sm:inline">Buscar</span>
                </motion.button>
              </div>
            </form>
          </div>
        </div>

        {user ? (
          <div className="relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenMenu(!openMenu);
              }}
              type="button"
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 transition-all duration-300 border border-indigo-200 dark:border-indigo-700"
            >
              <div className="relative">
                <img
                  src={user.photoUrl || "https://i.pravatar.cc/150?img=1"}
                  alt="avatar"
                  className="w-10 h-10 rounded-full ring-2 ring-indigo-400 dark:ring-indigo-500 object-cover"
                  onError={(e) => {
                    e.target.src = "https://i.pravatar.cc/150?img=1";
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-300 hidden sm:block">{user.name}</span>
              <motion.div
                animate={{ rotate: openMenu ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <FaUser className="text-indigo-600 dark:text-indigo-400" />
              </motion.div>
            </motion.button>
            <AnimatePresence>
              {openMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-2 z-[100] border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 rounded-lg text-gray-700 dark:text-gray-300 transition-all duration-200 group"
                    onClick={() => setOpenMenu(false)}
                  >
                    <FaBookOpen className="text-indigo-500 group-hover:scale-110 transition-transform" />
                    <span>Mis cursos inscritos</span>
                  </Link>
                  <Link
                    to="/instructor"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 rounded-lg text-gray-700 dark:text-gray-300 transition-all duration-200 group"
                    onClick={() => setOpenMenu(false)}
                  >
                    <FaChalkboardTeacher className="text-purple-500 group-hover:scale-110 transition-transform" />
                    <span>Mis cursos creados</span>
                  </Link>
                  <Link
                    to="/favorites"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 rounded-lg text-gray-700 dark:text-gray-300 transition-all duration-200 group"
                    onClick={() => setOpenMenu(false)}
                  >
                    <FaHeart className="text-red-500 group-hover:scale-110 transition-transform" />
                    <span>Mis Favoritos</span>
                  </Link>
                  <Link
                    to="/following"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 rounded-lg text-gray-700 dark:text-gray-300 transition-all duration-200 group"
                    onClick={() => setOpenMenu(false)}
                  >
                    <FaUserPlus className="text-blue-500 group-hover:scale-110 transition-transform" />
                    <span>Instructores Seguidos</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 rounded-lg text-gray-700 dark:text-gray-300 transition-all duration-200 group"
                    onClick={() => setOpenMenu(false)}
                  >
                    <FaUserCircle className="text-pink-500 group-hover:scale-110 transition-transform" />
                    <span>Información del perfil</span>
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-all duration-200 group"
                    >
                      <FaSignOutAlt className="group-hover:scale-110 transition-transform" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex gap-3 whitespace-nowrap">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors duration-300"
              >
                Iniciar sesión
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Registrarse
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
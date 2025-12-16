import { motion } from "framer-motion";
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaInstagram, FaYoutube, FaEnvelope, FaRocket, FaGraduationCap, FaUsers, FaAward } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const socialLinks = [
    { icon: FaFacebook, href: "#", label: "Facebook", color: "hover:text-blue-500" },
    { icon: FaTwitter, href: "#", label: "Twitter", color: "hover:text-sky-400" },
    { icon: FaInstagram, href: "#", label: "Instagram", color: "hover:text-pink-500" },
    { icon: FaLinkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-600" },
    { icon: FaYoutube, href: "#", label: "YouTube", color: "hover:text-red-500" },
    { icon: FaGithub, href: "#", label: "GitHub", color: "hover:text-gray-300" },
  ];

  const quickLinks = [
    { name: "Inicio", path: "/" },
    { name: "Cursos", path: "/" },
    { name: "Instructor", path: "/instructor" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Perfil", path: "/profile" },
  ];

  const resources = [
    { name: "Centro de Ayuda", path: "#" },
    { name: "Blog", path: "#" },
    { name: "Planes y Precios", path: "#" },
    { name: "Términos y Condiciones", path: "#" },
    { name: "Política de Privacidad", path: "#" },
  ];

  const stats = [
    { icon: FaUsers, number: "5,000+", label: "Estudiantes" },
    { icon: FaGraduationCap, number: "35+", label: "Cursos" },
    { icon: FaAward, number: "98%", label: "Satisfacción" },
    { icon: FaRocket, number: "500+", label: "Empresas" },
  ];

  return (
    <footer className="relative w-full bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-gray-300 overflow-hidden">
      {/* Efecto de partículas animadas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const randomX = Math.random() * 100;
          const randomY = Math.random() * 100;
          const randomDuration = Math.random() * 3 + 2;
          const randomDelay = Math.random() * 2;
          
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-indigo-400 rounded-full opacity-20"
              initial={{
                x: `${randomX}%`,
                y: `${randomY}%`,
              }}
              animate={{
                y: [`${randomY}%`, `${(randomY + 30) % 100}%`],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: randomDuration,
                repeat: Infinity,
                delay: randomDelay,
              }}
            />
          );
        })}
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 w-full">
        {/* Sección de estadísticas */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="border-b border-gray-700/50 py-12"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.1, y: -5 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4 shadow-lg">
                  <stat.icon className="text-2xl text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contenido principal del footer */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="py-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Logo y descripción */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mb-6"
              >
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                  MiniUdemy
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  Transforma tu carrera con cursos creados por expertos. Aprende habilidades esenciales para el futuro.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FaEnvelope className="text-indigo-400" />
                  <span>contacto@miniudemy.com</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Enlaces rápidos */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full"></span>
                Explorar
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Link
                      to={link.path}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-0 h-0.5 bg-indigo-400 group-hover:w-4 transition-all duration-300"></span>
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Recursos */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full"></span>
                Recursos
              </h3>
              <ul className="space-y-3">
                {resources.map((resource, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Link
                      to={resource.path}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-0 h-0.5 bg-indigo-400 group-hover:w-4 transition-all duration-300"></span>
                      {resource.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Redes sociales y newsletter */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full"></span>
                Síguenos
              </h3>
              <div className="flex flex-wrap gap-3 mb-8">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-12 h-12 bg-gray-800 hover:bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-xl text-gray-400 ${social.color} transition-all duration-300 shadow-lg hover:shadow-xl`}
                  >
                    <social.icon />
                  </motion.a>
                ))}
              </div>
              
              {/* Newsletter */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-white mb-3">Newsletter</h4>
                <p className="text-xs text-gray-400 mb-3">Recibe las últimas actualizaciones</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Tu email"
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-shadow"
                  >
                    <FaRocket />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Línea inferior */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-t border-gray-700/50 py-8"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400 text-center md:text-left">
                © {currentYear} MiniUdemy. Todos los derechos reservados.
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <Link to="#" className="hover:text-white transition-colors">Términos</Link>
                <Link to="#" className="hover:text-white transition-colors">Privacidad</Link>
                <Link to="#" className="hover:text-white transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gradiente decorativo inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
    </footer>
  );
}
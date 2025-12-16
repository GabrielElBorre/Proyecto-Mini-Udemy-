import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function AI() {
  const aiTopics = [
    {
      title: "Machine Learning",
      description: "Aprende los fundamentos del aprendizaje automático, algoritmos supervisados y no supervisados, y cómo entrenar modelos predictivos.",
      icon: "🤖",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Deep Learning",
      description: "Profundiza en redes neuronales profundas, CNN, RNN, y arquitecturas avanzadas como Transformers y GPT.",
      icon: "🧠",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Natural Language Processing",
      description: "Procesamiento de lenguaje natural, chatbots, análisis de sentimientos y generación de texto con IA.",
      icon: "💬",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Computer Vision",
      description: "Reconocimiento de imágenes, detección de objetos, segmentación y aplicaciones de visión por computadora.",
      icon: "👁️",
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Reinforcement Learning",
      description: "Aprendizaje por refuerzo, algoritmos Q-learning, políticas y aplicaciones en juegos y robótica.",
      icon: "🎮",
      color: "from-indigo-500 to-blue-500"
    },
    {
      title: "AI Ethics",
      description: "Ética en IA, sesgos algorítmicos, privacidad, transparencia y responsabilidad en sistemas de IA.",
      icon: "⚖️",
      color: "from-teal-500 to-cyan-500"
    }
  ];

  const aiTools = [
    { name: "TensorFlow", description: "Framework de Google para ML y DL" },
    { name: "PyTorch", description: "Framework de Facebook para deep learning" },
    { name: "Scikit-learn", description: "Biblioteca de ML para Python" },
    { name: "OpenAI API", description: "APIs para GPT y otros modelos" },
    { name: "Hugging Face", description: "Modelos pre-entrenados y transformers" },
    { name: "Jupyter Notebooks", description: "Entorno de desarrollo para IA" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Inteligencia Artificial
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Descubre el fascinante mundo de la IA. Desde conceptos básicos hasta aplicaciones avanzadas, 
          aprende cómo la inteligencia artificial está transformando el mundo.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button asChild>
            <Link to="/">Explorar Cursos de IA</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Volver al Inicio</Link>
          </Button>
        </div>
      </motion.div>

      {/* Temas de IA */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Áreas de la Inteligencia Artificial</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiTopics.map((topic, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="h-full hover:shadow-lg transition cursor-pointer">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${topic.color} flex items-center justify-center text-3xl mb-4`}>
                    {topic.icon}
                  </div>
                  <CardTitle className="text-xl">{topic.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{topic.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Herramientas Populares */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Herramientas y Frameworks Populares</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiTools.map((tool, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="hover:shadow-md transition">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{tool.name}</h3>
                  <p className="text-gray-600 text-sm">{tool.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Aplicaciones de IA */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Aplicaciones de la IA en la Vida Real</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🚗 Vehículos Autónomos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                La IA permite a los vehículos autónomos percibir su entorno, tomar decisiones 
                y navegar de forma segura sin intervención humana.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>🏥 Diagnóstico Médico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Sistemas de IA ayudan a los médicos a diagnosticar enfermedades con mayor precisión 
                analizando imágenes médicas y datos del paciente.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>🎯 Recomendaciones Personalizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Plataformas como Netflix, Spotify y Amazon usan IA para recomendar contenido 
                personalizado basado en tus preferencias.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>💬 Asistentes Virtuales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Siri, Alexa y Google Assistant utilizan procesamiento de lenguaje natural 
                para entender y responder a comandos de voz.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg p-8 text-center"
      >
        <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar tu viaje en IA?</h2>
        <p className="text-lg mb-6 opacity-90">
          Explora nuestros cursos de inteligencia artificial y comienza a construir el futuro.
        </p>
        <Button 
          size="lg" 
          className="bg-white text-indigo-600 hover:bg-gray-100"
          asChild
        >
          <Link to="/">Ver Cursos Disponibles</Link>
        </Button>
      </motion.section>
    </div>
  );
}



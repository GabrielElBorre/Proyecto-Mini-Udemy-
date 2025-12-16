import { FaCode, FaPaintBrush, FaRobot, FaChartLine } from "react-icons/fa";

const categorias = [
  { nombre: "Desarrollo", icono: <FaCode />, color: "bg-indigo-100 text-indigo-600" },
  { nombre: "Diseño", icono: <FaPaintBrush />, color: "bg-pink-100 text-pink-600" },
  { nombre: "Inteligencia Artificial", icono: <FaRobot />, color: "bg-green-100 text-green-600" },
  { nombre: "Marketing", icono: <FaChartLine />, color: "bg-yellow-100 text-yellow-600" },
];

export default function CategoryGrid() {
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-center mb-8">Explora por categoría 🔎</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {categorias.map((cat) => (
          <div
            key={cat.nombre}
            className={`flex flex-col items-center justify-center p-6 rounded-xl shadow hover:scale-105 transition-transform cursor-pointer ${cat.color}`}
          >
            <div className="text-4xl mb-3">{cat.icono}</div>
            <p className="font-semibold">{cat.nombre}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
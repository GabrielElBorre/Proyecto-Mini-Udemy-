import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ProgressChart({ completed = 3, total = 5 }) {
  const progress = Math.round((completed / total) * 100);

  const data = {
    labels: ["Completado", "Pendiente"],
    datasets: [
      {
        data: [progress, 100 - progress],
        backgroundColor: ["#4f46e5", "#e5e7eb"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: "70%",
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-32 h-32">
        <Doughnut data={data} options={options} />
      </div>
      <p className="mt-2 text-lg font-semibold text-indigo-600">
        {progress}% completado
      </p>
    </div>
  );
}
"use client";

import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import * as XLSX from "xlsx";
import ExcelImportForm from "@/components/ExcelImportForm";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

type Gasto = {
  id: number;
  monto: number;
  categoria: string;
  fecha: string;
  descripcion: string;
};

interface GastosResumenProps {
  gastos: Gasto[];
  onImportSuccess?: () => void;
}

export default function GastosResumen({
  gastos,
  onImportSuccess,
}: GastosResumenProps) {
  const porCategoria = gastos.reduce((acc: Record<string, number>, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.monto;
    return acc;
  }, {});

  const porMes = gastos.reduce((acc: Record<string, number>, g) => {
    const fecha = new Date(g.fecha);
    const key = `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + g.monto;
    return acc;
  }, {});

  const exportarXLSX = () => {
    if (gastos.length === 0) return;
    const datos = gastos.map((g) => ({
      Monto: g.monto,
      Categoría: g.categoria,
      Fecha: new Date(g.fecha).toLocaleDateString(),
      Descripción: g.descripcion,
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gastos");
    XLSX.writeFile(wb, "gastos.xlsx");
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "bottom" as const } },
  };

  return (
    <div className="w-full space-y-6">
      {/* Total y botón de exportar */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={exportarXLSX}
          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition"
        >
          Exportar Excel
        </button>

        <ExcelImportForm onSuccess={onImportSuccess} />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Gasto por Categoría
          </h3>
          <Bar
            data={{
              labels: Object.keys(porCategoria),
              datasets: [
                {
                  label: "Gasto por categoría",
                  data: Object.values(porCategoria),
                  backgroundColor: "rgba(59, 130, 246, 0.5)",
                  borderColor: "rgba(59, 130, 246, 1)",
                  borderWidth: 1,
                },
              ],
            }}
            options={options}
          />
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Gasto por Mes
          </h3>
          <Bar
            data={{
              labels: Object.keys(porMes),
              datasets: [
                {
                  label: "Gasto por mes",
                  data: Object.values(porMes),
                  backgroundColor: "rgba(16, 185, 129, 0.5)",
                  borderColor: "rgba(16, 185, 129, 1)",
                  borderWidth: 1,
                },
              ],
            }}
            options={options}
          />
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow md:col-span-2 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 text-center">
            Proporción por Categoría
          </h3>
          <div className="w-full max-w-md h-[350px]">
            <Pie
              data={{
                labels: Object.keys(porCategoria),
                datasets: [
                  {
                    label: "Proporción por categoría",
                    data: Object.values(porCategoria),
                    backgroundColor: [
                      "#3b82f6",
                      "#f97316",
                      "#10b981",
                      "#f43f5e",
                      "#6366f1",
                      "#eab308",
                    ],
                  },
                ],
              }}
              options={options}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

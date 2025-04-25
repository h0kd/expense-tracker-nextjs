"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import CountUp from "react-countup";
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
  hideFilters?: boolean;
}

export default function GastosResumen({
  hideFilters = false,
}: GastosResumenProps) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [filtros, setFiltros] = useState({ anio: "", mes: "", categoria: "" });

  useEffect(() => {
    async function fetchGastos() {
      const res = await fetch("/api/gastos");
      const data = await res.json();
      setGastos(data);
    }
    fetchGastos();
  }, []);

  const gastosFiltrados = !hideFilters
    ? gastos.filter((g) => {
        const fecha = new Date(g.fecha);
        const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
        const anio = fecha.getFullYear().toString();
        return (
          (!filtros.anio || filtros.anio === anio) &&
          (!filtros.mes || filtros.mes === mes) &&
          (!filtros.categoria || filtros.categoria === g.categoria)
        );
      })
    : gastos;

  const totalGastado = gastosFiltrados.reduce((acc, g) => acc + g.monto, 0);

  const porCategoria = gastosFiltrados.reduce(
    (acc: Record<string, number>, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + g.monto;
      return acc;
    },
    {}
  );

  const porMes = gastosFiltrados.reduce((acc: Record<string, number>, g) => {
    const fecha = new Date(g.fecha);
    const key = `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + g.monto;
    return acc;
  }, {});

  const barDataCategoria = {
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
  };

  const barDataMes = {
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
  };

  const pieData = {
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
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "bottom" as const } },
  };

  const exportarXLSX = () => {
    if (gastosFiltrados.length === 0) return;
    const datos = gastosFiltrados.map((g) => ({
      Monto: g.monto,
      Categoría: g.categoria,
      Fecha: new Date(g.fecha).toLocaleDateString(),
      Descripción: g.descripcion,
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gastos");
    XLSX.writeFile(wb, "gastos-filtrados.xlsx");
  };

  return (
    <div className="w-full space-y-6">
      {!hideFilters && (
        <>
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 justify-start mb-4">
            {/** Año, Mes y Categoría con clases dark */}
            {["anio", "mes", "categoria"].map((campo, idx) => (
              <div key={idx} className="flex flex-col">
                <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  {campo === "anio"
                    ? "Año"
                    : campo === "mes"
                    ? "Mes"
                    : "Categoría"}
                </label>
                <select
                  value={filtros.anio}
                  onChange={(e) =>
                    setFiltros({
                      ...filtros,
                      [campo]: e.target.value === "Todos" ? "" : e.target.value,
                    })
                  }
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option>Todos</option>
                  {campo === "anio" &&
                    [
                      ...new Set(
                        gastos.map((g) => new Date(g.fecha).getFullYear())
                      ),
                    ]
                      .sort((a, b) => b - a)
                      .map((a) => <option key={a}>{a}</option>)}
                  {campo === "mes" &&
                    Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m.toString().padStart(2, "0")}>
                        {m.toString().padStart(2, "0")}
                      </option>
                    ))}
                  {campo === "categoria" &&
                    [...new Set(gastos.map((g) => g.categoria))].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                </select>
              </div>
            ))}
          </div>

          {/* Total y botón de exportar */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Total gastado:{" "}
              <span className="text-blue-600 dark:text-blue-400">
                $
                <CountUp
                  start={0}
                  end={totalGastado}
                  duration={1}
                  separator="."
                  decimals={0}
                />
              </span>
            </p>
            <button
              onClick={exportarXLSX}
              className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              Exportar Excel
            </button>
          </div>
        </>
      )}

      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Gasto por Categoría
          </h3>
          <Bar data={barDataCategoria} options={options} />
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Gasto por Mes
          </h3>
          <Bar data={barDataMes} options={options} />
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow md:col-span-2 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 text-center">
            Proporción por Categoría
          </h3>
          <div className="w-full max-w-md h-[350px]">
            <Pie data={pieData} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
}

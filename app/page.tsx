"use client";

import { useEffect, useState } from "react";
import CountUp from "react-countup";
import GastosResumen from "@/components/GastosResumen";
import GastoForm from "@/components/GastoForm";
import GastosTable from "@/components/GastosTable";

type Gasto = {
  id: number;
  monto: number;
  categoria: string;
  fecha: string;
  descripcion: string;
};

export default function Home() {
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

  const gastosFiltrados = gastos.filter((g) => {
    const fecha = new Date(g.fecha);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const anio = fecha.getFullYear().toString();
    return (
      (!filtros.anio || filtros.anio === anio) &&
      (!filtros.mes || filtros.mes === mes) &&
      (!filtros.categoria || filtros.categoria === g.categoria)
    );
  });

  const totalGastado = gastosFiltrados.reduce((acc, g) => acc + g.monto, 0);

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-800 dark:text-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mb-12">
        {/* Filtros y Total */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Año */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">Año</label>
              <select
                value={filtros.anio}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    anio: e.target.value === "Todos" ? "" : e.target.value,
                  })
                }
                className="p-2 border rounded text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 dark:border-gray-600"
              >
                <option>Todos</option>
                {[
                  ...new Set(
                    gastos.map((g) => new Date(g.fecha).getFullYear())
                  ),
                ]
                  .sort((a, b) => b - a)
                  .map((a) => (
                    <option key={a}>{a}</option>
                  ))}
              </select>
            </div>

            {/* Mes */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">Mes</label>
              <select
                value={filtros.mes}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    mes: e.target.value === "Todos" ? "" : e.target.value,
                  })
                }
                className="p-2 border rounded text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 dark:border-gray-600"
              >
                <option>Todos</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m.toString().padStart(2, "0")}>
                    {m.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoría */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">Categoría</label>
              <select
                value={filtros.categoria}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    categoria: e.target.value === "Todas" ? "" : e.target.value,
                  })
                }
                className="p-2 border rounded text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 dark:border-gray-600"
              >
                <option>Todas</option>
                {[...new Set(gastos.map((g) => g.categoria))].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-lg font-semibold">
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
        </div>

        <div />

        {/* Gráficos */}
        <div className="lg:col-span-3">
          <GastosResumen hideFilters />
        </div>

        {/* Formulario */}
        <div className="lg:col-span-1">
          <GastoForm />
        </div>
      </div>

      {/* Tabla */}
      <div className="max-w-7xl mx-auto">
        <GastosTable />
      </div>
    </main>
  );
}

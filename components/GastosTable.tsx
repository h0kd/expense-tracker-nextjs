"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export type Gasto = {
  id: number;
  monto: number;
  categoria: string;
  fecha: string;
  descripcion: string;
};

interface GastosTableProps {
  gastos: Gasto[];
  fetchGastos: () => Promise<void>;
}

export default function GastosTable({ gastos, fetchGastos }: GastosTableProps) {
  const [confirmarId, setConfirmarId] = useState<number | null>(null);
  const [editando, setEditando] = useState<Gasto | null>(null);

  // sorting state
  const [sortColumn, setSortColumn] = useState<
    "monto" | "categoria" | "fecha" | ""
  >("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: "monto" | "categoria" | "fecha") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedGastos = useMemo(() => {
    if (!sortColumn) return gastos;
    return [...gastos].sort((a, b) => {
      let aVal: string | number = a[sortColumn];
      let bVal: string | number = b[sortColumn];
      if (sortColumn === "fecha") {
        aVal = a.fecha;
        bVal = b.fecha;
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [gastos, sortColumn, sortDirection]);

  const handleDelete = async () => {
    if (!confirmarId) return;
    try {
      const res = await fetch(`/api/gastos/${confirmarId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("🗑️ Gasto eliminado correctamente.");
        setConfirmarId(null);
        fetchGastos();
      }
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    try {
      const res = await fetch(`/api/gastos/${editando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editando),
      });
      if (res.ok) {
        toast.success("✏️ Gasto editado correctamente.");
        setEditando(null);
        fetchGastos();
      }
    } catch (error) {
      console.error("Error al editar gasto:", error);
    }
  };

  if (gastos.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        No hay gastos registrados.
      </p>
    );
  }

  return (
    <div className="w-full overflow-auto mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Gastos Registrados
      </h2>

      {/* Delete Dialog */}
      <Dialog.Root
        open={confirmarId !== null}
        onOpenChange={() => setConfirmarId(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content className="fixed z-50 left-1/2 top-1/2 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded bg-white dark:bg-gray-900 p-6 shadow-md">
            <Dialog.Title className="text-lg font-bold text-center mb-4 text-gray-800 dark:text-gray-100">
              Confirmar Eliminación
            </Dialog.Title>
            <div className="flex flex-col items-center gap-4">
              <ExclamationTriangleIcon className="text-yellow-500 w-12 h-12" />
              <p className="text-center text-gray-700 dark:text-gray-300">
                ¿Seguro que quieres eliminar este gasto?
              </p>
              <div className="flex gap-4 mt-6">
                <Dialog.Close asChild>
                  <button className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800">
                    Cancelar
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit Dialog */}
      <Dialog.Root
        open={editando !== null}
        onOpenChange={() => setEditando(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content className="fixed z-50 left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded bg-white dark:bg-gray-900 p-6 shadow-md">
            <Dialog.Title className="text-lg font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
              Editar Gasto
            </Dialog.Title>
            {editando && (
              <form onSubmit={handleUpdate} className="space-y-4">
                <input
                  type="number"
                  value={editando.monto}
                  onChange={(e) =>
                    setEditando({
                      ...editando,
                      monto: parseFloat(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Monto"
                />

                {/* categoría ahora como select */}
                <select
                  value={editando.categoria}
                  onChange={(e) =>
                    setEditando({ ...editando, categoria: e.target.value })
                  }
                  className="w-full p-2 border rounded text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="Comida">Comida</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Entretenimiento">Entretenimiento</option>
                  <option value="Transferencias">Transferencias</option>
                  <option value="Comisiones/Arte">Comisiones/Arte</option>
                  <option value="Cultura">Cultura</option>
                  <option value="Licencias/Trabajo">Licencias/Trabajo</option>
                  <option value="Otros">Otros</option>
                </select>

                <input
                  type="date"
                  value={editando.fecha.slice(0, 10)}
                  onChange={(e) =>
                    setEditando({ ...editando, fecha: e.target.value })
                  }
                  className="w-full p-2 border rounded text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                />

                <textarea
                  value={editando.descripcion}
                  onChange={(e) =>
                    setEditando({ ...editando, descripcion: e.target.value })
                  }
                  className="w-full p-2 border rounded text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Descripción"
                />

                <div className="flex justify-end gap-2 mt-4">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                    >
                      Cancelar
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Table */}
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full table-auto border-collapse text-gray-800 dark:text-gray-100">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th
                className="px-3 py-2 cursor-pointer"
                onClick={() => handleSort("monto")}
              >
                Monto
                {sortColumn === "monto" &&
                  (sortDirection === "asc" ? " ▲" : " ▼")}
              </th>
              <th
                className="px-3 py-2 cursor-pointer"
                onClick={() => handleSort("categoria")}
              >
                Categoría
                {sortColumn === "categoria" &&
                  (sortDirection === "asc" ? " ▲" : " ▼")}
              </th>
              <th
                className="px-3 py-2 cursor-pointer"
                onClick={() => handleSort("fecha")}
              >
                Fecha
                {sortColumn === "fecha" &&
                  (sortDirection === "asc" ? " ▲" : " ▼")}
              </th>
              <th className="px-3 py-2">Descripción</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedGastos.map((gasto) => (
              <tr
                key={gasto.id}
                className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 even:bg-gray-100 dark:even:bg-gray-900"
              >
                <td className="px-3 py-2">${gasto.monto.toLocaleString()}</td>
                <td className="px-3 py-2">{gasto.categoria}</td>
                <td className="px-3 py-2">
                  {new Date(gasto.fecha).toLocaleDateString()}
                </td>
                <td className="px-3 py-2 max-w-[200px] truncate">
                  {gasto.descripcion}
                </td>
                <td className="px-3 py-2 space-x-2">
                  <button
                    onClick={() => setEditando(gasto)}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmarId(gasto.id)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

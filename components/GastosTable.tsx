"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

type Gasto = {
  id: number;
  monto: number;
  categoria: string;
  fecha: string;
  descripcion: string;
};

interface GastosTableProps {
  gastos: Gasto[];
}

export default function GastosTable({ gastos }: GastosTableProps) {
  const [editando, setEditando] = useState<Gasto | null>(null);

  const handleEdit = (gasto: Gasto) => {
    setEditando(gasto);
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm("¿Estás seguro de eliminar este gasto?");
    if (!confirm) return;

    try {
      const res = await fetch(`/api/gastos/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        window.location.reload(); // recarga la página para ver los cambios (opcional: luego podemos mejorarlo)
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
        window.location.reload(); // para que refresque
      }
    } catch (error) {
      console.error("Error al actualizar gasto:", error);
    }
  };

  if (gastos.length === 0)
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        No hay gastos registrados.
      </p>
    );

  return (
    <div className="w-full overflow-auto mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Gastos Registrados
      </h2>

      {/* Dialog para editar */}
      <Dialog.Root
        open={!!editando}
        onOpenChange={(open) => !open && setEditando(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content className="fixed z-50 left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded bg-white dark:bg-gray-900 p-6 shadow-md">
            <Dialog.Title className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
              Editar Gasto
            </Dialog.Title>

            {editando && (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Monto
                  </label>
                  <input
                    type="number"
                    value={editando.monto}
                    onChange={(e) =>
                      setEditando({
                        ...editando,
                        monto: parseFloat(e.target.value),
                      })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={editando.categoria}
                    onChange={(e) =>
                      setEditando({ ...editando, categoria: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={editando.fecha.slice(0, 10)}
                    onChange={(e) =>
                      setEditando({ ...editando, fecha: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Descripción
                  </label>
                  <textarea
                    value={editando.descripcion}
                    onChange={(e) =>
                      setEditando({ ...editando, descripcion: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 rounded"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      onClick={() => setEditando(null)}
                    >
                      Cancelar
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Tabla */}
      <table className="min-w-full table-auto border-collapse text-gray-800 dark:text-gray-100">
        <thead>
          <tr className="bg-gray-800 text-white dark:bg-gray-700">
            <th className="px-3 py-2">Monto</th>
            <th className="px-3 py-2">Categoría</th>
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Descripción</th>
            <th className="px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {gastos.map((gasto) => (
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
                  onClick={() => handleEdit(gasto)}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(gasto.id)}
                  className="text-red-600 dark:text-red-400 hover:underline"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

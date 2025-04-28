"use client";

import { useEffect, useState } from "react";

export default function GastoForm({ onSuccess }: { onSuccess?: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    monto: "",
    categoria: "",
    fecha: "",
    descripcion: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // <--- NUEVO

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/gastos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setForm({ monto: "", categoria: "", fecha: "", descripcion: "" });
        setSuccessMessage("✅ Gasto agregado correctamente."); // <--- NUEVO
        if (onSuccess) onSuccess();

        // Eliminar mensaje después de 3 segundos
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error al guardar el gasto", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded shadow w-full max-w-md border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-xl font-bold">Registrar Gasto</h2>

      {successMessage && (
        <div className="text-green-600 bg-green-100 dark:bg-green-900 p-2 rounded text-sm">
          {successMessage}
        </div>
      )}

      <input
        type="number"
        name="monto"
        placeholder="Monto"
        value={form.monto}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
      />

      <select
        name="categoria"
        value={form.categoria}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
      >
        <option value="">Selecciona categoría</option>
        <option value="Comida">Comida</option>
        <option value="Transporte">Transporte</option>
        <option value="Servicios">Servicios</option>
        <option value="Otros">Otros</option>
      </select>

      <input
        type="date"
        name="fecha"
        value={form.fecha}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
      />

      <textarea
        name="descripcion"
        placeholder="Descripción"
        value={form.descripcion}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Guardando..." : "Guardar Gasto"}
      </button>
    </form>
  );
}

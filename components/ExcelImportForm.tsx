"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

type GastoExcelRow = {
  Fecha: string;
  Detalle: string;
  "Monto cargo ($)": string | number;
};

type GastoExistente = {
  fecha: string;
  descripcion: string;
  monto: number;
};

type GastoApiResponse = {
  fecha: string;
  descripcion: string;
  monto: number;
  [key: string]: unknown;
};

export default function ExcelImportForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [gastosExistentes, setGastosExistentes] = useState<GastoExistente[]>(
    []
  );

  useEffect(() => {
    fetch("/api/gastos")
      .then((res) => res.json())
      .then((data: GastoApiResponse[]) =>
        setGastosExistentes(
          data.map((g) => ({
            fecha: g.fecha.slice(0, 10),
            descripcion: g.descripcion.trim().toLowerCase(),
            monto: g.monto,
          }))
        )
      );
  }, []);

  const categorizarGasto = (detalle: string): string => {
    const lower = detalle.toLowerCase();
    if (lower.includes("uber trip")) return "Transporte";
    if (lower.includes("uber eats")) return "Comida";
    if (
      lower.includes("google play") ||
      lower.includes("youtube") ||
      lower.includes("googl")
    )
      return "Servicios";
    if (
      lower.includes("vending store") ||
      lower.includes("inattiburger") ||
      lower.includes("tottus")
    )
      return "Comida";
    if (
      lower.includes("tecnomas") ||
      lower.includes("pc web express") ||
      lower.includes("supletech")
    )
      return "Tecnología";
    if (
      lower.includes("movired") ||
      lower.includes("transvip") ||
      lower.includes("express plaza") ||
      lower.includes("whoosh")
    )
      return "Transporte";
    if (lower.includes("paypal") && lower.includes("twitch"))
      return "Entretenimiento";
    if (lower.includes("steamgames") || lower.includes("discord"))
      return "Entretenimiento";
    if (
      lower.includes("mach") ||
      lower.includes("transfer") ||
      lower.includes("transf")
    )
      return "Transferencias";
    if (lower.includes("suwie")) return "Comisiones/Arte";
    if (lower.includes("antartica") || lower.includes("libro"))
      return "Cultura";
    if (lower.includes("lmx digital")) return "Licencias/Trabajo";
    return "Otros";
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<GastoExcelRow>(sheet, {
      defval: "",
      range: 2,
    });

    const resumen: Record<string, number> = {};
    let importados = 0;

    for (const row of rows) {
      const fechaStr = row["Fecha"];
      const descripcion = row["Detalle"];
      const montoRaw = row["Monto cargo ($)"];

      if (!fechaStr || !descripcion || !montoRaw) {
        console.log("Fila omitida por datos faltantes:", row);
        continue;
      }

      const [day, month, year] = fechaStr.split("-");
      const fechaReal = new Date(+year, +month - 1, +day - 1);
      const fecha = fechaReal.toISOString().slice(0, 10);

      const monto =
        typeof montoRaw === "string"
          ? parseInt(montoRaw.replace(/\./g, ""), 10)
          : montoRaw;

      const categoria = categorizarGasto(descripcion);

      const yaExiste = gastosExistentes.some(
        (g) =>
          g.fecha === fecha &&
          g.descripcion === descripcion.trim().toLowerCase() &&
          g.monto === monto
      );
      if (yaExiste) continue;

      try {
        await fetch("/api/gastos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fecha, descripcion, categoria, monto }),
        });

        resumen[categoria] = (resumen[categoria] || 0) + 1;
        importados++;
      } catch (err) {
        console.error("Error al importar gasto", err);
      }
    }

    setLoading(false);
    if (onSuccess) onSuccess();

    if (importados === 0) {
      toast("No se importó ningún gasto (posiblemente duplicados).");
    } else {
      const resumenTexto = Object.entries(resumen)
        .map(([cat, cantidad]) => `${cat}: ${cantidad}`)
        .join(" · ");
      toast.success(`✅ Se importaron ${importados} gastos\n${resumenTexto}`);
    }
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        Importar Excel del banco
      </label>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFile}
        disabled={loading}
        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
      />
    </div>
  );
}

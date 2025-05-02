// app/api/gastos/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const body = await request.json();
  const id = getIdFromRequestUrl(request.url);
  if (!id) {
    return NextResponse.json({ error: "ID no encontrado" }, { status: 400 });
  }

  // Parseamos manualmente YYYY-MM-DD para evitar desfase de zona horaria
  const [yearStr, monthStr, dayStr] = (body.fecha ?? "").split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // monthIndex 0–11
  const day = parseInt(dayStr, 10);
  if ([year, month, day].some((n) => isNaN(n))) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }
  const fecha = new Date(year, month, day);

  const gastoActualizado = await prisma.gasto.update({
    where: { id: Number(id) },
    data: {
      monto: body.monto,
      categoria: body.categoria,
      fecha, // ahora un Date local correcto
      descripcion: body.descripcion,
    },
  });

  return NextResponse.json(gastoActualizado);
}

export async function DELETE(request: Request) {
  const id = getIdFromRequestUrl(request.url);
  if (!id) {
    return NextResponse.json({ error: "ID no encontrado" }, { status: 400 });
  }
  await prisma.gasto.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}

function getIdFromRequestUrl(url: string): string | null {
  try {
    const parts = new URL(url).pathname.split("/");
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

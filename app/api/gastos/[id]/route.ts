import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const body = await request.json();
  const id = getIdFromRequestUrl(request.url);

  if (!id) {
    return NextResponse.json({ error: "ID no encontrado" }, { status: 400 });
  }

  const gastoActualizado = await prisma.gasto.update({
    where: { id: Number(id) },
    data: {
      monto: body.monto,
      categoria: body.categoria,
      fecha: body.fecha,
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

  await prisma.gasto.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ ok: true });
}

// Función auxiliar para extraer el ID de la URL
function getIdFromRequestUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const parts = parsedUrl.pathname.split("/");
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

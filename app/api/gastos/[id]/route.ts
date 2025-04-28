import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const body = await request.json();
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop(); // extraemos el id de la URL

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
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop(); // extraemos el id

  if (!id) {
    return NextResponse.json({ error: "ID no encontrado" }, { status: 400 });
  }

  await prisma.gasto.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ ok: true });
}

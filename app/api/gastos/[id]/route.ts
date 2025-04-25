// app/api/gastos/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { monto, categoria, fecha, descripcion } = await req.json();
  const actualizado = await prisma.gasto.update({
    where: { id: Number(params.id) },
    data: {
      monto: Number(monto),
      categoria,
      fecha: new Date(fecha).toISOString(),
      descripcion,
    },
  });
  return NextResponse.json(actualizado);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.gasto.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}

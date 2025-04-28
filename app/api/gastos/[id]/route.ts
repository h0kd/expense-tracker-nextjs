import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const { params } = context;

  await prisma.gasto.delete({
    where: { id: Number(params.id) },
  });

  return NextResponse.json({ ok: true });
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const { params } = context;
  const data = await request.json();

  const gastoActualizado = await prisma.gasto.update({
    where: { id: Number(params.id) },
    data,
  });

  return NextResponse.json(gastoActualizado);
}

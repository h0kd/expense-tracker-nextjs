// app/api/gastos/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // tu cliente de Prisma

export async function GET() {
  const gastos = await prisma.gasto.findMany();
  return NextResponse.json(gastos);
}

export async function POST(req: Request) {
  const { monto, categoria, fecha, descripcion } = await req.json();
  const creado = await prisma.gasto.create({
    data: {
      monto: Number(monto),
      categoria,
      fecha: new Date(fecha).toISOString(),
      descripcion,
    },
  });
  return NextResponse.json(creado, { status: 201 });
}

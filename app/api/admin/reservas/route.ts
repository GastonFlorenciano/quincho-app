import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reservas = await prisma.reserva.findMany({
      orderBy: { fecha: "asc" },
    });

    return NextResponse.json({ success: true, reservas });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
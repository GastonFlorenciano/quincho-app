import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fecha = searchParams.get("fecha");

  if (!fecha) return NextResponse.json({ error: "Falta fecha" }, { status: 400 });

  const reservas = await prisma.reserva.findMany({
    where: { fecha: new Date(fecha) }
  });

  let disponibilidad = {
    MANANA: true,
    NOCHE: true,
    COMPLETO: true
  };

  for (const r of reservas) {
    if (r.turno === "COMPLETO") {
      disponibilidad = { MANANA: false, NOCHE: false, COMPLETO: false };
      break;
    } else if (r.turno === "MANANA") {
      disponibilidad.MANANA = false;
      disponibilidad.COMPLETO = false;
    } else if (r.turno === "NOCHE") {
      disponibilidad.NOCHE = false;
      disponibilidad.COMPLETO = false;
    }
  }

  return NextResponse.json(disponibilidad);
}
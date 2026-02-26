import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mes = searchParams.get("mes");
  const anio = searchParams.get("anio");

  if (!mes || !anio) {
    return NextResponse.json({ error: "Faltan parámetros de mes o año" }, { status: 400 });
  }

  // Creamos el rango del mes para buscar todas las reservas de una sola vez
  const fechaInicio = dayjs(`${anio}-${mes}-01`).startOf('month').toDate();
  const fechaFin = dayjs(fechaInicio).endOf('month').toDate();

  const reservas = await prisma.reserva.findMany({
    where: {
      fecha: {
        gte: fechaInicio,
        lte: fechaFin
      }
    }
  });

  // Agrupamos la disponibilidad por fecha
  const disponibilidad: Record<string, { MANANA: boolean; NOCHE: boolean; COMPLETO: boolean }> = {};

  reservas.forEach(r => {
    const fechaKey = dayjs(r.fecha).format("YYYY-MM-DD");
    
    if (!disponibilidad[fechaKey]) {
      disponibilidad[fechaKey] = { MANANA: true, NOCHE: true, COMPLETO: true };
    }

    if (r.turno === "COMPLETO") {
      disponibilidad[fechaKey] = { MANANA: false, NOCHE: false, COMPLETO: false };
    } else if (r.turno === "MANANA") {
      disponibilidad[fechaKey].MANANA = false;
      disponibilidad[fechaKey].COMPLETO = false;
    } else if (r.turno === "NOCHE") {
      disponibilidad[fechaKey].NOCHE = false;
      disponibilidad[fechaKey].COMPLETO = false;
    }
  });

  return NextResponse.json(disponibilidad);
}
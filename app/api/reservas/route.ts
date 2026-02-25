import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calcularPrecio(turno: string, incluyeSegundoSalon: boolean) {
  let precio = 0;

  if (turno === "MANANA") precio = 95000;
  if (turno === "NOCHE") precio = 115000;
  if (turno === "COMPLETO") precio = 168000;

  if (incluyeSegundoSalon) precio += 50000;

  return precio;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      fecha,
      turno,
      incluyeSegundoSalon,
      nombre,
      apellido,
      telefono,
      metodoPago
    } = body;

    if (!fecha || !turno || !nombre || !apellido || !telefono || !metodoPago) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    // Validar disponibilidad
    const reservaExistente = await prisma.reserva.findFirst({
      where: {
        fecha: new Date(fecha),
        OR: [
          { turno: turno },
          { turno: "COMPLETO" }
        ]
      }
    });

    if (reservaExistente) {
      return NextResponse.json(
        { error: "Turno no disponible" },
        { status: 400 }
      );
    }

    const precio = calcularPrecio(turno, incluyeSegundoSalon);

    const nuevaReserva = await prisma.reserva.create({
      data: {
        fecha: new Date(fecha),
        turno,
        incluyeSegundoSalon,
        nombre,
        apellido,
        telefono,
        precioTotal: precio,
        estado: metodoPago === "EFECTIVO" ? "EFECTIVO" : "PENDIENTE",
        metodoPago
      }
    });

    return NextResponse.json(nuevaReserva);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
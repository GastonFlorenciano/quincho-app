-- CreateEnum
CREATE TYPE "Turno" AS ENUM ('MANANA', 'NOCHE', 'COMPLETO');

-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('PENDIENTE', 'PAGADO', 'EFECTIVO', 'CANCELADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('MERCADOPAGO', 'EFECTIVO');

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "turno" "Turno" NOT NULL,
    "incluyeSegundoSalon" BOOLEAN NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "precioTotal" INTEGER NOT NULL,
    "estado" "Estado" NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

"use server";

import { cookies } from 'next/headers';
import { prisma } from "../lib/prisma"; // Asegurate de que la ruta sea correcta

export async function loginAdmin(password: string) {
    // Leemos la contraseña del .env
    const adminPassword = process.env.ADMIN_PASS;

    if (!adminPassword) {
        return { success: false, error: "Falta configurar ADMIN_PASS en el servidor." };
    }

    if (password === adminPassword) {
        // Creamos una cookie segura que dura 1 día (86400 segundos)
        (await cookies()).set('admin_session', 'autorizado', { 
            httpOnly: true, // Inaccesible por JavaScript en el cliente (muy seguro)
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24,
            path: '/',
        });
        return { success: true };
    } else {
        return { success: false, error: "Contraseña incorrecta." };
    }
}

export async function logoutAdmin() {
    (await cookies()).delete('admin_session');
}

// --- FUNCIONES DE BASE DE DATOS PARA EL PANEL ---

export async function obtenerTodasLasReservas() {
    try {
        // Buscamos todas las reservas ordenadas por fecha (las más nuevas primero)
        const reservas = await prisma.reserva.findMany({
            orderBy: {
                fecha: 'desc',
            },
        });
        return reservas;
    } catch (error) {
        console.error("Error al obtener reservas:", error);
        return [];
    }
}

// 🔥 ACÁ AGREGAMOS "PENDIENTE" PARA PODER REVERTIR EL ESTADO
export async function actualizarEstadoReserva(id: string, nuevoEstado: "PAGADO" | "PENDIENTE" | "CANCELADO") {
    try {
        await prisma.reserva.update({
            where: { id },
            data: { estado: nuevoEstado }
        });
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar reserva:", error);
        return { success: false, error: "No se pudo actualizar la reserva" };
    }
}

// Función para borrar UNA o VARIAS reservas a la vez
export async function eliminarReservas(ids: string[]) {
    try {
        await prisma.reserva.deleteMany({
            where: {
                id: { in: ids } 
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar reservas:", error);
        return { success: false, error: "No se pudieron eliminar las reservas" };
    }
}
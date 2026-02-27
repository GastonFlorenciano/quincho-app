"use server";

import { cookies } from 'next/headers';

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
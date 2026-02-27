import { cookies } from 'next/headers';
import LoginForm from './LoginForm';
import { logoutAdmin } from '@/services/admin.service';
import { LogOut } from 'lucide-react';
import { obtenerTodasLasReservas } from '@/services/actions.service';
import AdminTableClient from '@/components/AdminTableClient'; // Importamos el nuevo componente interactivo

// Forzamos a que esta página sea dinámica
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const cookieStore = cookies();
    const isAuthenticated = (await cookieStore).get('admin_session')?.value === 'autorizado';

    if (!isAuthenticated) {
        return <LoginForm />;
    }

    // Traemos TODAS las reservas de la base de datos directamente
    const reservas = await obtenerTodasLasReservas();

    return (
        <main className="min-h-screen bg-orange-50 flex flex-col items-center p-4 pt-28  overflow-x-hidden">
            <div className="max-w-6xl w-full mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-orange-100 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Administrador</h1>
                        <p className="text-sm text-gray-500">Gestión de reservas</p>
                    </div>
                    
                    <form action={logoutAdmin}>
                        <button type="submit" className="flex items-center gap-2 px-5 py-2.5 border border-red-500 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-colors text-sm">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </form>
                </header>

                {/* Renderizamos la tabla interactiva y le pasamos los datos */}
                <AdminTableClient reservas={reservas} />
                
            </div>
        </main>
    );
}
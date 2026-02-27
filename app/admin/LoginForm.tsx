"use client";

import { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { loginAdmin } from '@/services/admin.service'; 
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await loginAdmin(password);

        if (result.success) {
            router.refresh(); // Refresca la página para mostrar el panel
        } else {
            setError(result.error || 'Error desconocido');
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-orange-500 overflow-hidden flex flex-col p-8 animate-in zoom-in duration-300">
                <div className="flex flex-col items-center mb-6 text-orange-600">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Acceso Privado</h1>
                    <p className="text-sm text-gray-500 text-center mt-2">Ingresá tu contraseña maestra para ver las reservas.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative flex items-center">
                        <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                        <input 
                            type="password" 
                            required 
                            placeholder="Contraseña" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-9 py-3 bg-orange-50 border border-orange-100 rounded-xl text-sm text-black outline-none focus:border-orange-500 transition-colors"
                        />
                    </div>

                    {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all hover:bg-orange-700"
                    >
                        {loading ? "Verificando..." : "Ingresar"} <ArrowRight className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </main>
    );
}
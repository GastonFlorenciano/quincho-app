"use client";

import { ArrowLeft, User, Phone, Clock, Home, Check } from 'lucide-react';
import { useState } from 'react';
import { crearReserva } from "@/services/actions.service";

interface ReservationFormProps {
    selectedDate: Date;
    onBack: () => void;
    disponibilidad: { MANANA: boolean; NOCHE: boolean; COMPLETO: boolean };
}

export default function ReservationForm({ selectedDate, onBack, disponibilidad }: ReservationFormProps) {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        turno: '' as 'MANANA' | 'NOCHE' | 'COMPLETO' | '',
        incluyeSegundoSalon: false,
    });

    const turns = [
        { id: 'MANANA', label: 'Mañana', time: '7:00 a 19:00', available: disponibilidad.MANANA },
        { id: 'NOCHE', label: 'Noche', time: '20:00 a 04:00', available: disponibilidad.NOCHE },
        { id: 'COMPLETO', label: 'Día Completo', time: '07:00 a 04:00', available: disponibilidad.COMPLETO },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.turno) return alert("Selecciona un turno");

        setLoading(true);
        try {
            await crearReserva({
                ...formData,
                fecha: selectedDate,
                turno: formData.turno as any,
                metodoPago: "EFECTIVO"
            });
            setSubmitted(true);
        } catch (error) {
            alert("Error al reservar. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 animate-in fade-in zoom-in duration-300 border">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-orange-100">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Reserva Exitosa!</h2>
                    <p className="text-gray-500 mb-6">Te esperamos el {selectedDate.toLocaleDateString('es-AR')}</p>
                    <button onClick={onBack} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-semibold">Volver</button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-5 px-4">
            <div className="max-w-md mx-auto">
                <button onClick={onBack} className="flex items-center text-gray-600 hover:text-orange-600 mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Volver al calendario
                </button>

                <form onSubmit={handleSubmit} className="bg-white rounded-3xl px-4 py-4 shadow-xl border border-orange-500 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 text-center">Tus Datos</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <input required placeholder="Nombre" className="w-full px-4 py-3 bg-orange-50  border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-gray-400 text-black"
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                        <input required placeholder="Apellido" className="w-full px-4 py-3 bg-orange-50  border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-gray-400 text-black"
                            onChange={e => setFormData({ ...formData, apellido: e.target.value })} />
                    </div>

                    <input required type="tel" placeholder="Teléfono" className="w-full px-4 py-3 bg-orange-50  border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-gray-400 text-black"
                        onChange={e => setFormData({ ...formData, telefono: e.target.value })} />

                    <div className="space-y-3">
                        <label htmlFor="turno-select" className="font-semibold text-gray-700 flex items-center">
                            <Clock className="w-4 h-4 mr-2" /> Selecciona el turno
                        </label>

                        <div className="relative">
                            <select
                                id="turno-select"
                                required
                                value={formData.turno}
                                onChange={(e) => setFormData({ ...formData, turno: e.target.value as any })}
                                className={`w-full px-4 py-3 bg-orange-50 border-2 rounded-xl outline-none transition-all appearance-none cursor-pointer
        ${formData.turno
                                        ? 'border-orange-500 text-gray-900'
                                        : 'border-transparent text-gray-500 focus:ring-2 focus:ring-orange-500'
                                    }
      `}
                            >
                                <option value="" disabled>Elegir un turno...</option>
                                {turns.map((t) => (
                                    <option
                                        key={t.id}
                                        value={t.id}
                                        disabled={!t.available}
                                        className="text-gray-900"
                                    >
                                        {t.label} ({t.time}) {!t.available ? '- No disponible' : ''}
                                    </option>
                                ))}
                            </select>

                            {/* Icono de flecha personalizado ya que usamos appearance-none */}
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-orange-600">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <label className="flex items-center p-4 bg-orange-50 rounded-xl cursor-pointer group">
                            <input type="checkbox" className="w-5 h-5 accent-orange-600 mr-3"
                                onChange={e => setFormData({ ...formData, incluyeSegundoSalon: e.target.checked })} />
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Salón Extra</span>
                                    <span className="text-orange-600 font-bold">+$50.000</span>
                                </div>
                            </div>
                        </label>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-orange-700 transition-all active:scale-95 disabled:bg-gray-400">
                        {loading ? "Procesando..." : "Confirmar Reserva"}
                    </button>
                </form>
            </div>
        </div>
    );
}
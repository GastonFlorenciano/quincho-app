"use client";

import { ArrowLeft, User, Phone, Clock, Check, NotebookPen, Receipt, DollarSign, Wallet } from 'lucide-react';
import { useState, useMemo } from 'react';
import { crearReserva } from "@/services/actions.service";

// Definimos precios fijos para el cálculo
const PRECIOS = {
    MANANA: 95000,
    NOCHE: 115000,
    SALON_EXTRA: 50000
};

export default function ReservationForm({ selectedDate, onBack, disponibilidad }: any) {
    const [loading, setLoading] = useState(false);

    // Controlamos el flujo: 'form' -> 'summary' -> 'success'
    const [step, setStep] = useState<'form' | 'summary' | 'success'>('form');

    const [formData, setFormData] = useState({
        nombre: '', apellido: '', telefono: '',
        turno: '' as 'MANANA' | 'NOCHE' | 'COMPLETO' | '',
        incluyeSegundoSalon: false,
    });

    // Formateador de moneda argentina
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
    };

    // Calculamos precio completo con descuento del 20%
    const precioCompleto = (PRECIOS.MANANA + PRECIOS.NOCHE) * 0.8;

    const turns = [
        { id: 'MANANA', label: 'Mañana (7-19hs)', price: PRECIOS.MANANA, available: disponibilidad.MANANA },
        { id: 'NOCHE', label: 'Noche (20-4hs)', price: PRECIOS.NOCHE, available: disponibilidad.NOCHE },
        { id: 'COMPLETO', label: 'Completo (7-4hs)', price: precioCompleto, available: disponibilidad.COMPLETO },
    ];

    // Cálculo total dinámico
    const total = useMemo(() => {
        let sum = 0;
        const selectedTurn = turns.find(t => t.id === formData.turno);
        if (selectedTurn) sum += selectedTurn.price;
        if (formData.incluyeSegundoSalon) sum += PRECIOS.SALON_EXTRA;
        return sum;
    }, [formData.turno, formData.incluyeSegundoSalon]);

    const handleContinuar = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.turno) return alert("Seleccioná un turno");
        setStep('summary'); // Pasamos al resumen
    };

    const handleConfirmar = async (metodoPago: 'EFECTIVO' | 'TRANSFERENCIA') => {
        if (metodoPago === 'TRANSFERENCIA') {
            // Aquí iría la lógica de pago futuro
            alert("Funcionalidad de pago online próximamente");
            return;
        }

        setLoading(true);
        try {
            await crearReserva({
                ...formData,
                fecha: selectedDate,
                turno: formData.turno as any,
                metodoPago
            });
            setStep('success');
        } catch (error) {
            alert("Error al reservar");
        } finally {
            setLoading(false);
        }
    };

    // VISTA DE ÉXITO FINAL
    if (step === 'success') {
        return (
            <div className="w-full h-[420px] bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center border border-orange-500 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="text-green-600 w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">¡Reserva Exitosa!</h2>
                <p className="text-gray-500 text-sm mb-6 text-center">Te esperamos el {selectedDate.toLocaleDateString('es-AR')}</p>
                <p className='text-gray-500 text-sm'>¡Muchas gracias!</p>
            </div>
        );
    }

    // VISTA DE RESUMEN (Paso Intermedio)
    if (step === 'summary') {
        const turnoInfo = turns.find(t => t.id === formData.turno);

        return (
            <div className="bg-white rounded-3xl shadow-xl border border-orange-500 overflow-hidden flex flex-col max-h-[470px] relative animate-in slide-in-from-right duration-300">
                {/* Cabecera Resumen */}
                <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-center justify-center relative">
                    <button
                        onClick={() => setStep('form')}
                        className="absolute left-4 p-2 bg-orange-600 rounded-xl text-white hover:bg-orange-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-orange-600" />
                        <h2 className="text-lg font-bold text-gray-800">Resumen</h2>
                    </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                    <div className="space-y-4">
                        {/* Tarjeta de Datos */}
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm">
                            <p className="font-semibold text-gray-800"><User className="inline w-3 h-3 mr-1" /> {formData.nombre} {formData.apellido}</p>
                            <p className="text-gray-600 ml-4">{formData.telefono}</p>
                        </div>

                        {/* Tarjeta de Detalle de Precios */}
                        <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 text-sm space-y-2">
                            <div className="flex justify-between font-medium text-gray-700">
                                <span>{selectedDate.toLocaleDateString('es-AR')}</span>
                                <span className="font-bold text-orange-600">{turnoInfo?.label.split('(')[0]}</span>
                            </div>
                            <div className="border-t border-orange-200/50 my-2"></div>

                            <div className="flex justify-between text-gray-600">
                                <span>Valor Turno</span>
                                <span>{formatPrice(turnoInfo?.price || 0)}</span>
                            </div>

                            {formData.incluyeSegundoSalon && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Salón Extra</span>
                                    <span>{formatPrice(PRECIOS.SALON_EXTRA)}</span>
                                </div>
                            )}

                            <div className="border-t border-orange-200 my-2"></div>
                            <div className="flex justify-between text-base font-bold text-gray-900">
                                <span>Total</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mt-2">
                        <button
                            onClick={() => handleConfirmar('EFECTIVO')}
                            disabled={loading}
                            className="w-full flex items-center justify-between px-4 bg-green-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-green-700 active:scale-95 transition-all"
                        >
                            <span className="flex items-center gap-2"><DollarSign className="w-5 h-5" /> Pagar en Efectivo</span>
                            <span className="text-xs font-normal opacity-90">Confirmar ahora</span>
                        </button>

                        <button
                            onClick={() => handleConfirmar('TRANSFERENCIA')}
                            className="w-full flex items-center justify-between px-4 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all"
                        >
                            <span className="flex items-center gap-2"><Wallet className="w-5 h-5" /> Transferencia</span>
                            <span className="text-xs font-normal opacity-90">Mercado Pago</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // VISTA DEL FORMULARIO (Original, sin cambios estéticos salvo precios en select)
    return (
        <div className="bg-white rounded-3xl shadow-xl border border-orange-500 overflow-hidden flex flex-col h-[420px] relative">
            <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-center justify-center relative">
                <button
                    onClick={onBack}
                    className="absolute left-4 p-2 bg-orange-600 rounded-xl text-white hover:bg-orange-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <NotebookPen className="w-5 h-5 text-orange-600" />
                    <h2 className="text-lg font-bold text-gray-800">Tus Datos</h2>
                </div>
            </div>

            <form onSubmit={handleContinuar} className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative flex items-center">
                            <User className="absolute left-3 w-4 h-4 text-gray-400" />
                            <input required placeholder="Nombre" value={formData.nombre} className="w-full pl-9 py-2 bg-orange-50 border border-orange-100 rounded-lg text-sm text-black outline-none focus:border-orange-400 transition-colors"
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                        </div>
                        <div className="relative flex items-center">
                            <User className="absolute left-3 w-4 h-4 text-gray-400" />
                            <input required placeholder="Apellido" value={formData.apellido} className="w-full pl-9 py-2 bg-orange-50 border border-orange-100 rounded-lg text-sm text-black outline-none focus:border-orange-400 transition-colors"
                                onChange={e => setFormData({ ...formData, apellido: e.target.value })} />
                        </div>
                    </div>

                    <div className="relative flex items-center">
                        <Phone className="absolute left-3 w-4 h-4 text-gray-400" />
                        <input required type="tel" placeholder="Teléfono" value={formData.telefono} className="w-full pl-9 py-2 bg-orange-50 border border-orange-100 rounded-lg text-sm text-black outline-none focus:border-orange-400 transition-colors"
                            onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-orange-600 uppercase ml-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Turno
                        </label>
                        <select required value={formData.turno} onChange={e => setFormData({ ...formData, turno: e.target.value as any })}
                            className="w-full px-3 py-2 bg-orange-50 border border-orange-100 rounded-lg text-sm text-black outline-none cursor-pointer focus:border-orange-400 transition-colors">
                            <option value="" disabled>Elegir turno...</option>
                            {turns.map(t => (
                                <option key={t.id} value={t.id} disabled={!t.available}>
                                    {t.label}
                                    {t.available
                                        ? ` - ${formatPrice(t.price)} ${t.id === 'COMPLETO' ? '(20% OFF)' : ''}`
                                        : ' (Agotado)'
                                    }
                                </option>
                            ))}
                        </select>
                    </div>

                    <label className="flex items-center p-3 bg-orange-50 rounded-xl border border-orange-100 cursor-pointer hover:border-orange-300 transition-colors">
                        <input type="checkbox" checked={formData.incluyeSegundoSalon} className="w-4 h-4 accent-orange-600 mr-3" onChange={e => setFormData({ ...formData, incluyeSegundoSalon: e.target.checked })} />
                        <span className="text-xs font-semibold text-gray-700 flex-1">Salón Extra</span>
                        <span className="text-xs font-bold text-orange-600">+{formatPrice(PRECIOS.SALON_EXTRA)}</span>
                    </label>
                </div>

                <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all mt-4 hover:bg-orange-700">
                    Siguiente
                </button>
            </form>
        </div>
    );
}
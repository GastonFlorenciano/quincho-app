"use client";

import { ArrowLeft, User, Phone, Clock, Check, NotebookPen, Receipt, ArrowRight, MessageCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { crearReserva } from "@/services/actions.service";

const PRECIOS = {
    MANANA: 95000,
    NOCHE: 115000,
    SALON_EXTRA: 50000
};

export default function ReservationForm({ selectedDate, onBack, disponibilidad }: any) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'summary' | 'success'>('form');

    // 🔥 PONÉ TU NÚMERO DE WHATSAPP ACÁ (con código de país, sin el +, ej: 5493704123456)
    const WHATSAPP_DUENO = "5493716616092"; 

    const [formData, setFormData] = useState({
        nombre: '', apellido: '', telefono: '',
        turno: '' as 'MANANA' | 'NOCHE' | 'COMPLETO' | '',
        incluyeSegundoSalon: false,
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
    };

    const precioCompleto = (PRECIOS.MANANA + PRECIOS.NOCHE) * 0.8;

    const turns = [
        { id: 'MANANA', label: 'Mañana (7-19hs)', price: PRECIOS.MANANA, available: disponibilidad.MANANA },
        { id: 'NOCHE', label: 'Noche (20-4hs)', price: PRECIOS.NOCHE, available: disponibilidad.NOCHE },
        { id: 'COMPLETO', label: 'Completo (7-4hs)', price: precioCompleto, available: disponibilidad.COMPLETO },
    ];

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
        setStep('summary');
    };

    const handleConfirmar = async () => {
        setLoading(true);
        try {
            // Mandamos 'EFECTIVO' por defecto para cumplir con la base de datos, 
            // ya que el pago real se coordina por fuera.
            await crearReserva({ 
                ...formData, 
                fecha: selectedDate, 
                turno: formData.turno as any, 
                metodoPago: 'EFECTIVO' 
            });
            setStep('success');
        } catch (error) { 
            alert("Error al reservar"); 
        } finally { 
            setLoading(false); 
        }
    };

    // Función para generar el link de WhatsApp automático
    const generarLinkWhatsApp = () => {
        const fechaFormat = selectedDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const turnoLabel = turns.find(t => t.id === formData.turno)?.label.split(' ')[0];
        const mensaje = `Hola! Acabo de hacer una pre-reserva en el Quincho para el *${fechaFormat}* (Turno ${turnoLabel}). Mi nombre es ${formData.nombre} ${formData.apellido}. Te escribo para coordinar el pago y confirmar mi fecha!`;
        return `https://wa.me/${WHATSAPP_DUENO}?text=${encodeURIComponent(mensaje)}`;
    };

    // --- VISTA 3: ÉXITO Y CONTACTO WHATSAPP ---
    if (step === 'success') {
        return (
            <div className="w-full h-[520px] bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center border border-orange-500 animate-in zoom-in duration-300 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="text-green-600 w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">¡Tu fecha está pre-reservada!</h2>
                
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6 w-full">
                    <p className="text-sm text-gray-700 font-medium mb-1">
                        Para confirmar la reserva al 100%, es necesario realizar la seña/pago.
                    </p>
                    <p className="text-xs text-orange-600 font-bold">
                        Tenés 24 horas para coordinar el pago, de lo contrario la reserva se anulará automáticamente.
                    </p>
                </div>

                <a 
                    href={generarLinkWhatsApp()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#20bd5a] transition-colors mb-3"
                >
                    <MessageCircle className="w-5 h-5" /> Hablar con el dueño
                </a>

                <button onClick={onBack} className="text-sm text-gray-500 font-semibold hover:text-gray-800 transition-colors">
                    Volver al Inicio
                </button>
            </div>
        );
    }

    // --- VISTA 2: RESUMEN DE RESERVA ---
    if (step === 'summary') {
        const turnoInfo = turns.find(t => t.id === formData.turno);

        return (
            <div className="bg-white rounded-3xl shadow-xl border border-orange-500 overflow-hidden flex flex-col h-[520px] relative animate-in slide-in-from-right duration-300">
                <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-center justify-center relative">
                    <button onClick={() => setStep('form')} className="absolute left-4 p-2 bg-orange-600 rounded-xl text-white hover:bg-orange-700 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-orange-600" />
                        <h2 className="text-lg font-bold text-gray-800">Resumen</h2>
                    </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm">
                            <p className="font-semibold text-gray-800"><User className="inline w-3 h-3 mr-1"/> {formData.nombre} {formData.apellido}</p>
                            <p className="text-gray-600 ml-4">{formData.telefono}</p>
                        </div>

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
                                <span>Total a Pagar</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="text-center text-[10px] text-gray-400 mb-3 italic">Al confirmar, podrás contactarte con el dueño para gestionar el pago.</p>
                        <button 
                            onClick={handleConfirmar}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-green-700 active:scale-95 transition-all"
                        >
                            {loading ? "Registrando..." : "Confirmar Reserva"} <Check className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VISTA 1: FORMULARIO ORIGINAL (Sin cambios) ---
    return (
        <div className="bg-white rounded-3xl shadow-xl border border-orange-500 overflow-hidden flex flex-col h-[520px] relative animate-in slide-in-from-left duration-300">
            <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-center justify-center relative">
                <button onClick={onBack} className="absolute left-4 p-2 bg-orange-600 rounded-xl text-white hover:bg-orange-700 transition-colors">
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
                                onChange={e => setFormData({...formData, nombre: e.target.value})} />
                        </div>
                        <div className="relative flex items-center">
                            <User className="absolute left-3 w-4 h-4 text-gray-400" />
                            <input required placeholder="Apellido" value={formData.apellido} className="w-full pl-9 py-2 bg-orange-50 border border-orange-100 rounded-lg text-sm text-black outline-none focus:border-orange-400 transition-colors"
                                onChange={e => setFormData({...formData, apellido: e.target.value})} />
                        </div>
                    </div>

                    <div className="relative flex items-center">
                        <Phone className="absolute left-3 w-4 h-4 text-gray-400" />
                        <input required type="tel" placeholder="Teléfono" value={formData.telefono} className="w-full pl-9 py-2 bg-orange-50 border border-orange-100 rounded-lg text-sm text-black outline-none focus:border-orange-400 transition-colors"
                            onChange={e => setFormData({...formData, telefono: e.target.value})} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-orange-600 uppercase ml-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Turno
                        </label>
                        <select required value={formData.turno} onChange={e => setFormData({...formData, turno: e.target.value as any})}
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
                        <input type="checkbox" checked={formData.incluyeSegundoSalon} className="w-4 h-4 accent-orange-600 mr-3" onChange={e => setFormData({...formData, incluyeSegundoSalon: e.target.checked})} />
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
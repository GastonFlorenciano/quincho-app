"use client";

import { useState } from 'react';
import { CalendarIcon, Phone, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // 🔥 Importamos Framer Motion

// Replicamos las funciones de cálculo dentro del cliente
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
};

const calcularTotal = (turno: string, incluyeSalon: boolean) => {
    let total = 0;
    if (turno === 'MANANA') total += 95000;
    if (turno === 'NOCHE') total += 115000;
    if (turno === 'COMPLETO') total += (95000 + 115000) * 0.8;
    if (incluyeSalon) total += 50000;
    return total;
};

export default function AdminTableClient({ reservas }: { reservas: any[] }) {
    const [currentPage, setCurrentPage] = useState(0);
    const [direction, setDirection] = useState<'right' | 'left'>('right');
    
    const ITEMS_PER_PAGE = 3;
    const totalPages = Math.ceil(reservas.length / ITEMS_PER_PAGE);

    const currentReservas = reservas.slice(
        currentPage * ITEMS_PER_PAGE, 
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setDirection('right');
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setDirection('left');
            setCurrentPage(prev => prev - 1);
        }
    };

    // 🔥 Configuramos las variantes de la animación para Framer Motion
    const variants = {
        enter: (direction: 'right' | 'left') => ({
            x: direction === 'right' ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: 'right' | 'left') => ({
            x: direction === 'right' ? -50 : 50,
            opacity: 0
        })
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-orange-200 overflow-hidden flex flex-col">
            {/* Altura mínima ajustada para que entren 3 filas sin que la tabla salte */}
            <div className="overflow-x-auto min-h-[280px]"> 
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-orange-50 border-b border-orange-100 text-orange-800 text-sm">
                            <th className="p-4 font-bold w-[15%]">Fecha</th>
                            <th className="p-4 font-bold w-[25%]">Cliente</th>
                            <th className="p-4 font-bold w-[15%]">Turno</th>
                            <th className="p-4 font-bold w-[15%]">Detalles</th>
                            <th className="p-4 font-bold w-[15%]">Total</th>
                            <th className="p-4 font-bold w-[15%]">Pago</th>
                        </tr>
                    </thead>
                    
                    {/* 🔥 AnimatePresence "espera" a que la animación termine antes de cambiar el DOM */}
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.tbody
                            key={currentPage}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            {reservas.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                        No hay reservas registradas aún.
                                    </td>
                                </tr>
                            ) : (
                                currentReservas.map((reserva: any) => (
                                    <tr key={reserva.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors text-sm">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 font-semibold text-gray-800">
                                                <CalendarIcon className="w-4 h-4 text-orange-500" />
                                                {new Date(reserva.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-gray-800">{reserva.nombre} {reserva.apellido}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <Phone className="w-3 h-3" /> {reserva.telefono}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                reserva.turno === 'MANANA' ? 'bg-amber-100 text-amber-700' :
                                                reserva.turno === 'NOCHE' ? 'bg-indigo-100 text-indigo-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {reserva.turno}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {reserva.incluyeSegundoSalon ? (
                                                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                                                    + Salón Extra
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 font-bold text-gray-900">
                                            {formatPrice(calcularTotal(reserva.turno, reserva.incluyeSegundoSalon))}
                                        </td>
                                        <td className="p-4">
                                            {reserva.metodoPago === 'EFECTIVO' ? (
                                                <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                                                    <CheckCircle className="w-4 h-4 text-gray-400" /> Efectivo (Al llegar)
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
                                                    <AlertCircle className="w-4 h-4 text-blue-500" /> Transferencia
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </motion.tbody>
                    </AnimatePresence>
                </table>
            </div>

            {/* Controles de Paginación */}
            {totalPages > 1 && (
                <div className="px-4 m-2 bg-gray-50 border-t border-gray-300 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                        Página {currentPage + 1} de {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handlePrev} 
                            disabled={currentPage === 0}
                            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={handleNext} 
                            disabled={currentPage >= totalPages - 1}
                            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
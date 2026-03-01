"use client";

import { useState, useMemo } from 'react';
import { CalendarIcon, Phone, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Search, ArrowUpDown, X, Trash2, AlertTriangle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
// Asegurate de que esta ruta sea la del archivo nuevo del backend:
import { actualizarEstadoReserva, eliminarReservas } from '@/services/admin.service';

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

// Función para detectar si pasaron más de 24 horas y sigue pendiente
const estaExpirada = (createdAt: string, estado: string) => {
    if (!createdAt || estado !== 'PENDIENTE') return false;
    const fechaCreacion = new Date(createdAt).getTime();
    const ahora = new Date().getTime();
    const diferenciaHoras = (ahora - fechaCreacion) / (1000 * 60 * 60);
    return diferenciaHoras > 24;
};

export default function AdminTableClient({ reservas }: { reservas: any[] }) {
    const router = useRouter();

    // --- ESTADOS PARA FILTROS Y ORDENAMIENTO ---
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); 

    // --- ESTADOS DE PAGINACIÓN ---
    const [currentPage, setCurrentPage] = useState(0);
    const [direction, setDirection] = useState<'right' | 'left'>('right');
    const ITEMS_PER_PAGE = 3;

    // --- ESTADOS DE ACCIONES EN BLOQUE ---
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
    const safeReservas = Array.isArray(reservas) ? reservas : [];
    const filteredAndSortedReservas = useMemo(() => {
        let result = safeReservas;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(reserva => 
                reserva?.nombre?.toLowerCase().includes(term) || 
                reserva?.apellido?.toLowerCase().includes(term)
            );
        }

        if (filterDate) {
            result = result.filter(reserva => {
                const reservaDate = new Date(reserva.fecha).toISOString().split('T')[0];
                return reservaDate === filterDate;
            });
        }

        result = [...result].sort((a, b) => {
            const dateA = new Date(a.fecha).getTime();
            const dateB = new Date(b.fecha).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [safeReservas, searchTerm, filterDate, sortOrder]);

    const totalPages = Math.ceil(filteredAndSortedReservas.length / ITEMS_PER_PAGE);

    const currentReservas = filteredAndSortedReservas.slice(
        currentPage * ITEMS_PER_PAGE, 
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    // --- MANEJO DE SELECCIÓN EN BLOQUE ---
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(currentReservas.map((r: any) => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`¿Borrar ${selectedIds.length} reserva/s? Esta acción no se puede deshacer.`)) return;
        
        setIsProcessing(true);
        const res = await eliminarReservas(selectedIds);
        if (res.success) {
            setSelectedIds([]); 
            router.refresh(); 
        } else {
            alert("Error al eliminar las reservas.");
        }
        setIsProcessing(false);
    };

    // --- ACCIONES INDIVIDUALES ---
    
    // 🔥 NUEVO: Función unificada para cambiar estado de ida y vuelta
    const handleCambiarEstado = async (id: string, nuevoEstado: "PAGADO" | "PENDIENTE") => {
        setIsProcessing(true);
        const res = await actualizarEstadoReserva(id, nuevoEstado);
        if (res.success) router.refresh();
        setIsProcessing(false);
    };

    const handleEliminarUna = async (id: string) => {
        if (!confirm("¿Borrar esta reserva?")) return;
        setIsProcessing(true);
        const res = await eliminarReservas([id]);
        if (res.success) router.refresh();
        setIsProcessing(false);
    };

    // --- MANEJADORES DE EVENTOS ---
    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setDirection('right');
            setCurrentPage(prev => prev + 1);
            setSelectedIds([]);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setDirection('left');
            setCurrentPage(prev => prev - 1);
            setSelectedIds([]);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0);
        setSelectedIds([]);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterDate(e.target.value);
        setCurrentPage(0);
        setSelectedIds([]);
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
        setCurrentPage(0);
        setSelectedIds([]);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterDate("");
        setCurrentPage(0);
        setSelectedIds([]);
    };

    const allSelected = currentReservas.length > 0 && selectedIds.length === currentReservas.length;

    const variants = {
        enter: (direction: 'right' | 'left') => ({ x: direction === 'right' ? 50 : -50, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction: 'right' | 'left') => ({ x: direction === 'right' ? -50 : 50, opacity: 0 })
    };

    return (
        <div className="flex flex-col gap-4">
            
            {/* --- BARRA DE HERRAMIENTAS --- */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar cliente..." 
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full md:w-64 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-400 text-black"
                        />
                    </div>

                    <div className="relative flex items-center">
                        <input 
                            type="date" 
                            value={filterDate}
                            onChange={handleDateChange}
                            className="w-full md:w-auto px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none focus:border-orange-400 focus:bg-white transition-all cursor-pointer"
                        />
                    </div>

                    {(searchTerm || filterDate) && (
                        <button 
                            onClick={clearFilters}
                            className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                        >
                            <X className="w-3 h-3" /> Limpiar
                        </button>
                    )}
                </div>

                <button 
                    onClick={toggleSortOrder}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-sm font-bold hover:bg-orange-100 transition-colors w-full md:w-auto justify-center"
                >
                    <ArrowUpDown className="w-4 h-4" />
                    {sortOrder === 'desc' ? 'Más recientes' : 'Más antiguas'}
                </button>
            </div>

            {/* 🔥 BARRA FLOTANTE PARA BORRAR EN BLOQUE */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 border border-red-200 p-4 rounded-2xl flex justify-between items-center shadow-sm"
                    >
                        <span className="text-red-700 font-bold text-sm">
                            {selectedIds.length} {selectedIds.length === 1 ? 'reserva seleccionada' : 'reservas seleccionadas'}
                        </span>
                        <button 
                            onClick={handleBulkDelete}
                            disabled={isProcessing}
                            className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex gap-2 items-center hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4"/> {isProcessing ? 'Procesando...' : 'Borrar Seleccionadas'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- TABLA DE RESERVAS --- */}
            <div className="bg-white rounded-3xl shadow-xl border border-orange-200 overflow-hidden flex flex-col">
                <div className="overflow-x-auto min-h-[280px]"> 
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-orange-50 border-b border-orange-100 text-orange-800 text-sm">
                                <th className="p-4 w-[5%]">
                                    <input type="checkbox" checked={allSelected} onChange={handleSelectAll} className="w-4 h-4 accent-orange-600 rounded cursor-pointer" />
                                </th>
                                <th className="p-4 font-bold w-[15%]">Fecha</th>
                                <th className="p-4 font-bold w-[20%]">Cliente</th>
                                <th className="p-4 font-bold w-[10%]">Turno</th>
                                <th className="p-4 font-bold w-[15%]">Total</th>
                                <th className="p-4 font-bold w-[15%]">Pago</th>
                                <th className="p-4 font-bold w-[20%]">Acciones</th>
                            </tr>
                        </thead>
                        
                        <AnimatePresence mode="wait" custom={direction} >
                            <motion.tbody
                                key={currentPage + sortOrder + searchTerm + filterDate}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                {currentReservas.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">
                                            <Search className="w-8 h-8 mb-2 mx-auto text-gray-500" />
                                            No se encontraron reservas.
                                        </td>
                                    </tr>
                                ) : (
                                    currentReservas.map((reserva: any) => {
                                        const expirada = estaExpirada(reserva.createdAt, reserva.estado);
                                        const isSelected = selectedIds.includes(reserva.id);

                                        return (
                                            <tr key={reserva.id} className={`border-b transition-colors text-sm ${isSelected ? 'bg-orange-50/50' : expirada ? 'bg-red-200 border-red-300' : 'border-gray-300 hover:bg-orange-100'}`}>
                                                <td className="px-4">
                                                    <input type="checkbox" checked={isSelected} onChange={() => handleSelectOne(reserva.id)} className="w-4 h-4 accent-orange-600 rounded cursor-pointer" />
                                                </td>
                                                <td className="px-4">
                                                    <div className="flex items-center gap-2 font-semibold text-gray-800">
                                                        <CalendarIcon className="w-4 h-4 text-orange-500" />
                                                        {new Date(reserva.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="px-4">
                                                    <p className="font-bold text-gray-800">{reserva.nombre} {reserva.apellido}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                        <Phone className="w-3 h-3" /> {reserva.telefono}
                                                    </p>
                                                </td>
                                                <td className="px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${reserva.turno === 'MANANA' ? 'bg-amber-100 text-amber-700' : reserva.turno === 'NOCHE' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {reserva.turno === 'MANANA' ? 'MAÑANA' : reserva.turno === 'NOCHE' ? 'NOCHE' : 'COMPLETO'}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-bold text-gray-900">
                                                    {formatPrice(calcularTotal(reserva.turno, reserva.incluyeSegundoSalon))}
                                                </td>
                                                <td className="p-4">
                                                    {reserva.estado === 'PENDIENTE' ? (
                                                        <div className={`flex items-center gap-1 text-xs font-bold ${expirada ? 'text-red-600' : 'text-amber-600'}`}>
                                                            {expirada ? <AlertTriangle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} 
                                                            {expirada ? 'Expirada' : 'Pendiente'}
                                                        </div>
                                                    ) : reserva.estado === 'PAGADO' ? (
                                                        <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                                                            <CheckCircle className="w-4 h-4 text-green-500" /> Pagado
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                                                            <CheckCircle className="w-4 h-4 text-gray-400" /> Efectivo
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 flex gap-2">
                                                    {/* 🔥 BOTONES DINÁMICOS DEPENDIENDO DEL ESTADO */}
                                                    {reserva.estado === 'PENDIENTE' ? (
                                                        <button 
                                                            onClick={() => handleCambiarEstado(reserva.id, 'PAGADO')} 
                                                            disabled={isProcessing} 
                                                            className="p-2 bg-green-50 border border-green-200 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors" 
                                                            title="Marcar como Pagado"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    ) : reserva.estado === 'PAGADO' ? (
                                                        <button 
                                                            onClick={() => handleCambiarEstado(reserva.id, 'PENDIENTE')} 
                                                            disabled={isProcessing} 
                                                            className="p-2 bg-amber-50 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-colors" 
                                                            title="Revertir a Pendiente"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    ) : null}
                                                    
                                                    <button 
                                                        onClick={() => handleEliminarUna(reserva.id)} 
                                                        disabled={isProcessing} 
                                                        className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors" 
                                                        title="Borrar Reserva"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </motion.tbody>
                        </AnimatePresence>
                    </table>
                </div>

                {/* Controles de Paginación */}
                {totalPages > 1 && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">
                            Página {currentPage + 1} de {totalPages} <span className="hidden md:inline">({filteredAndSortedReservas.length} resultados)</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <button onClick={handlePrev} disabled={currentPage === 0} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={handleNext} disabled={currentPage >= totalPages - 1} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
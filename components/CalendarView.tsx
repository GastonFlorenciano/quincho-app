"use client";

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

export default function CalendarView({ onDateSelect, disponibilidadPorFecha }: any) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const today = dayjs().startOf('day');
  const emptyDays = Array(currentMonth.startOf('month').day()).fill(null);
  const days = Array.from({ length: currentMonth.daysInMonth() }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-orange-500 overflow-hidden flex flex-col h-[400px] md:h-[420px] mt-16">
      {/* Cabecera Centrada */}
      <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-center justify-center gap-2">
        <CalendarIcon className="w-5 h-5 text-orange-600" />
        <h2 className="text-lg font-bold text-gray-800">Reserva tu fecha</h2>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))} className="p-1 text-orange-600 hover:bg-orange-100 rounded-full transition-colors"><ChevronLeft /></button>
          <span className="font-bold text-gray-800 capitalize">{currentMonth.format('MMMM YYYY')}</span>
          <button onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))} className="p-1 text-orange-600 hover:bg-orange-100 rounded-full transition-colors"><ChevronRight /></button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, index) => (
            <div key={`${d}-${index}`} className="text-center text-[10px] font-bold text-orange-300">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 flex-1 content-start h-64">
          {emptyDays.map((_, i) => <div key={i} />)}
          {days.map(day => {
            const dateObj = currentMonth.date(day).startOf('day');
            const dateStr = dateObj.format('YYYY-MM-DD');
            const disp = disponibilidadPorFecha[dateStr] || { MANANA: true, NOCHE: true, COMPLETO: true };
            const isFull = !disp.MANANA && !disp.NOCHE && !disp.COMPLETO;
            const isPast = dateObj.isBefore(today);

            return (
              <button key={day} disabled={isPast || isFull} onClick={() => onDateSelect(dateObj.toDate())}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold transition-all relative
                            ${isPast || isFull ? 'text-gray-300 bg-gray-50' : 'text-gray-700 bg-orange-200 hover:bg-orange-600 hover:text-white'}
                            ${dateObj.isSame(today, 'day') ? 'ring-2 ring-orange-600' : ''}`}>
                {day}
                {!isPast && isFull && <span className="absolute bottom-1 text-[5px] text-red-500 font-bold uppercase">Agotado</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
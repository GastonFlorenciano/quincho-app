"use client";

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import dayjs from 'dayjs';

interface CalendarViewProps {
  onDateSelect: (date: Date) => void;
  disponibilidadPorFecha: Record<string, any>;
}

export default function CalendarView({ onDateSelect, disponibilidadPorFecha }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const today = dayjs().startOf('day');

  const daysInMonth = currentMonth.daysInMonth();
  const startingDayOfWeek = currentMonth.startOf('month').day();

  const handleDateClick = (day: number) => {
    const selected = currentMonth.date(day).startOf('day');
    if (selected >= today) {
      onDateSelect(selected.toDate());
    }
  };

  const emptyDays = Array(startingDayOfWeek).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="py-5 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-2xl mb-4 shadow-lg">
            <CalendarIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reserva tu Quincho</h1>
          <p className="text-gray-600">Selecciona una fecha disponible</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))} className="p-2 hover:bg-orange-50 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-orange-600" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 capitalize">
              {currentMonth.format('MMMM YYYY')}
            </h2>
            <button onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))} className="p-2 hover:bg-orange-50 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5 text-orange-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="text-center text-xs font-bold text-gray-400 py-2">{d}</div>
            ))}
            {emptyDays.map((_, i) => <div key={`e-${i}`} />)}
            {days.map(day => {
              const dateObj = currentMonth.date(day).startOf('day');
              const dateStr = dateObj.format('YYYY-MM-DD');
              const isPast = dateObj.isBefore(today);
              
              // Lógica de disponibilidad de tu backend
              const disp = disponibilidadPorFecha[dateStr] || { MANANA: true, NOCHE: true, COMPLETO: true };
              const isFull = !disp.MANANA && !disp.NOCHE && !disp.COMPLETO;

              return (
                <button
                  key={day}
                  disabled={isPast || isFull}
                  onClick={() => onDateSelect(dateObj.toDate())}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all
                    ${isPast || isFull ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-orange-100 hover:scale-105'}
                    ${dateObj.isSame(today, 'day') ? 'border-2 border-orange-500' : ''}
                  `}
                >
                  {day}
                  {!isPast && isFull && <span className="text-[8px] text-red-400 uppercase font-bold">Lleno</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
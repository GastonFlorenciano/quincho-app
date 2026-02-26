"use client";

import { useState, useEffect } from 'react';
import CalendarView from '@/components/CalendarView';
import ReservationForm from '@/components/ReservationForm';
import { fetchDisponibilidadMes } from "@/services/actions.service";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [disponibilidadPorFecha, setDisponibilidadPorFecha] = useState<Record<string, any>>({});

  useEffect(() => {
    async function loadData() {
      const data = await fetchDisponibilidadMes(new Date());
      setDisponibilidadPorFecha(data);
    }
    loadData();
  }, []);

  return (
    // Agregamos overflow-x-hidden para que no aparezca la barra de scroll al deslizar
    <main className="min-h-screen bg-orange-50 flex items-start justify-center p-4 pt-28 overflow-x-hidden">
      <div className="w-full max-w-sm relative">
        
        {/* Contenedor del Calendario */}
        <div 
          className={`transition-all duration-500 ease-in-out transform ${
            !selectedDate 
              ? 'opacity-100 translate-x-0 relative z-10' 
              : 'opacity-0 -translate-x-12 absolute top-0 left-0 w-full z-0 pointer-events-none'
          }`}
        >
          <CalendarView 
            onDateSelect={setSelectedDate} 
            disponibilidadPorFecha={disponibilidadPorFecha} 
          />
        </div>

        {/* Contenedor del Formulario */}
        <div 
          className={`transition-all duration-500 ease-in-out transform ${
            selectedDate 
              ? 'opacity-100 translate-x-0 relative z-10' 
              : 'opacity-0 translate-x-12 absolute top-0 left-0 w-full z-0 pointer-events-none'
          }`}
        >
          <ReservationForm 
            // Usamos un fallback a new Date() para que no tire error cuando está oculto
            selectedDate={selectedDate || new Date()} 
            onBack={() => setSelectedDate(null)}
            disponibilidad={disponibilidadPorFecha[(selectedDate || new Date()).toISOString().split("T")[0]] || { MANANA: true, NOCHE: true, COMPLETO: true }}
          />
        </div>

      </div>
    </main>
  );
}
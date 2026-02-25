"use client";

import { useState, useEffect } from 'react';
import CalendarView from '@/components/CalendarView';
import ReservationForm from '@/components/ReservationForm';
import { fetchDisponibilidadMes } from "@/services/actions.service";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [disponibilidadPorFecha, setDisponibilidadPorFecha] = useState<Record<string, any>>({});

  // Cargar disponibilidad al inicio
  useEffect(() => {
    async function loadData() {
      const data = await fetchDisponibilidadMes(new Date());
      setDisponibilidadPorFecha(data);
    }
    loadData();
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleBack = () => {
    setSelectedDate(null);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-100">
      {!selectedDate ? (
        <CalendarView 
          onDateSelect={handleDateSelect} 
          disponibilidadPorFecha={disponibilidadPorFecha} 
        />
      ) : (
        <ReservationForm 
          selectedDate={selectedDate} 
          onBack={handleBack}
          disponibilidad={disponibilidadPorFecha[selectedDate.toISOString().split("T")[0]] || { MANANA: true, NOCHE: true, COMPLETO: true }}
        />
      )}
    </main>
  );
}
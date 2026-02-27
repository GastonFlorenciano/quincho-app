"use client";

import { useState, useEffect, useRef } from 'react';
import CalendarView from '@/components/CalendarView';
import ReservationForm from '@/components/ReservationForm';
import Carousel from '@/components/Carousel'; // Importamos el carrusel
import { fetchDisponibilidadMes } from "@/services/actions.service";
import { ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const reservationRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [disponibilidadPorFecha, setDisponibilidadPorFecha] = useState<Record<string, any>>({});

  const scrollToReservation = () => {
    const target = reservationRef.current;
    if (!target) return;

    const targetY = target.getBoundingClientRect().top + window.scrollY;
    const startY = window.scrollY;
    const duration = 900; // 🔥 Ajustá lo lento que quieras (ms)
    let startTime: DOMHighResTimeStamp | null = null;

    const animateScroll = (currentTime: DOMHighResTimeStamp) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;

      // Ease-out cubic (suave al final)
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);

      const progress = Math.min(elapsed / duration, 1);
      const scrollY = startY + (targetY - startY) * ease(progress);

      window.scrollTo(0, scrollY);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  useEffect(() => {
    async function loadData() {
      const data = await fetchDisponibilidadMes(new Date());
      setDisponibilidadPorFecha(data);
    }
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-orange-50 flex flex-col items-center p-4 pt-28 pb-12 overflow-x-hidden">

      {/* 2. El motion.div va ADENTRO, animando solo el contenido */}
      <motion.div
        initial={{ opacity: 0, y: -120 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full flex flex-col items-center" // Mantiene el centrado de tus elementos
      >

        {/* 1. Nuestro nuevo componente Carrusel */}
        <Carousel />

        {/* Flecha animada (Bounce) */}
        <div className="mt-8 flex flex-col items-center text-orange-600 animate-bounce">
          <button onClick={scrollToReservation} className="cursor-pointer text-xs font-bold uppercase tracking-widest mb-2 opacity-80 flex flex-col items-center hover:bg-orange-500 hover:text-white transition duration-400 ease-in-out p-2 rounded-lg">
            Reservar Ahora
            <ArrowDown className="w-6 h-6" />
          </button>
        </div>

        {/* 2. Sección de Reserva (Calendario y Formulario) */}
        <div className="w-full max-w-sm relative mt-4">
          <div
            className={`transition-all duration-500 ease-in-out transform ${!selectedDate
              ? 'opacity-100 translate-x-0 relative z-10'
              : 'opacity-0 -translate-x-12 absolute top-0 left-0 w-full z-0 pointer-events-none'
              }`}
          >
            <CalendarView
              onDateSelect={setSelectedDate}
              disponibilidadPorFecha={disponibilidadPorFecha}
            />
          </div>

          <div
            ref={reservationRef}
            className={`transition-all duration-500 ease-in-out transform ${selectedDate
              ? 'opacity-100 translate-x-0 relative z-10'
              : 'opacity-0 translate-x-12 absolute top-0 left-0 w-full z-0 pointer-events-none'
              }`}
          >
            <ReservationForm
              selectedDate={selectedDate || new Date()}
              onBack={() => setSelectedDate(null)}
              disponibilidad={disponibilidadPorFecha[(selectedDate || new Date()).toISOString().split("T")[0]] || { MANANA: true, NOCHE: true, COMPLETO: true }}
            />
          </div>
        </div>

      </motion.div>
    </main>
  );
}
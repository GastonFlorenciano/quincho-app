"use client";

import { useState } from "react";

interface TurnosProps {
  fecha: Date;
  disponibilidad: {
    MANANA: boolean;
    NOCHE: boolean;
    COMPLETO: boolean;
  };
  onSelectTurno: (turno: "MANANA" | "NOCHE" | "COMPLETO", incluyeSegundoSalon: boolean) => void;
}

export default function Turnos({ fecha, disponibilidad, onSelectTurno }: TurnosProps) {
  const [incluyeSegundoSalon, setIncluyeSegundoSalon] = useState(false);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<"MANANA" | "NOCHE" | "COMPLETO" | null>(null);

  const handleClick = (turno: "MANANA" | "NOCHE" | "COMPLETO") => {
    setTurnoSeleccionado(turno);
    onSelectTurno(turno, incluyeSegundoSalon);
  };

  return (
    <div className="mt-6 p-4 border rounded shadow-md bg-white max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-3 text-center">Selecciona un turno</h3>

      <div className="flex flex-col gap-2">
        {(["MANANA", "NOCHE", "COMPLETO"] as const).map((turno) => (
          <button
            key={turno}
            disabled={!disponibilidad[turno]}
            onClick={() => handleClick(turno)}
            className={`
              py-2 px-4 rounded font-medium transition
              ${disponibilidad[turno] ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"}
              ${turnoSeleccionado === turno ? "ring-2 ring-blue-500" : ""}
            `}
          >
            {turno} {turno === "COMPLETO" ? "(7:00 a 4:00)" : ""}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="checkbox"
          id="segundo-salon"
          checked={incluyeSegundoSalon}
          onChange={(e) => {
            setIncluyeSegundoSalon(e.target.checked);
            if (turnoSeleccionado) onSelectTurno(turnoSeleccionado, e.target.checked);
          }}
          className="w-4 h-4 accent-blue-500"
        />
        <label htmlFor="segundo-salon" className="text-gray-700">
          Incluir segundo salón (+$50.000)
        </label>
      </div>
    </div>
  );
}
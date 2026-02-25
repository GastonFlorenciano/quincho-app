import axios from "./axios";

/**
 * Obtiene la disponibilidad de turnos para un mes completo
 */
export async function fetchDisponibilidadMes(fecha: Date) {
  try {
    const res = await axios.get(
      `/disponibilidad?mes=${fecha.getMonth() + 1}&anio=${fecha.getFullYear()}`
    );
    // Devuelve algo como:
    // { "2026-02-24": { MANANA: true, NOCHE: false, COMPLETO: true }, ... }
    return res.data;
  } catch (error) {
    console.error("Error fetching disponibilidad del mes:", error);
    return {};
  }
}

/**
 * Crea una nueva reserva
 */
export async function crearReserva(data: {
  fecha: Date;
  turno: "MANANA" | "NOCHE" | "COMPLETO";
  incluyeSegundoSalon: boolean;
  nombre: string;
  apellido: string;
  telefono: string;
  metodoPago: "EFECTIVO" | "MERCADOPAGO";
}) {
  try {
    const res = await axios.post("/reservas", data);
    return res.data;
  } catch (error) {
    console.error("Error creando reserva:", error);
    throw error;
  }
}
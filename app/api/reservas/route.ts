import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from 'resend'; 

const resend = new Resend(process.env.RESEND_API_KEY);

function calcularPrecio(turno: string, incluyeSegundoSalon: boolean) {
  let precio = 0;
  if (turno === "MANANA") precio = 95000;
  if (turno === "NOCHE") precio = 115000;
  if (turno === "COMPLETO") precio = 168000;
  if (incluyeSegundoSalon) precio += 50000;
  return precio;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      fecha,
      turno,
      incluyeSegundoSalon,
      nombre,
      apellido,
      telefono,
    } = body;

    if (!fecha || !turno || !nombre || !apellido || !telefono) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const reservaExistente = await prisma.reserva.findFirst({
      where: {
        fecha: new Date(fecha),
        OR: turno === "COMPLETO" 
            ? undefined 
            : [
                { turno: turno },
                { turno: "COMPLETO" }
              ]
      }
    });

    if (reservaExistente) {
      return NextResponse.json(
        { error: "Turno no disponible" },
        { status: 400 }
      );
    }

    const precio = calcularPrecio(turno, incluyeSegundoSalon);

    const nuevaReserva = await prisma.reserva.create({
      data: {
        fecha: new Date(fecha),
        turno,
        incluyeSegundoSalon,
        nombre,
        apellido,
        telefono,
        precioTotal: precio,
        estado: "PENDIENTE", 
        metodoPago: "EFECTIVO" 
      }
    });

    // 🔥 ARMAMOS EL LINK DE WHATSAPP PARA EL DUEÑO
    // 1. Formateamos la fecha linda
    const fechaFormat = new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    // 2. Limpiamos el teléfono 

let telefonoLimpio = telefono.replace(/\D/g, ''); // Saca espacios, guiones, etc.

if (!telefonoLimpio.startsWith('54')) {

  if (telefonoLimpio.startsWith('0')) {
    telefonoLimpio = telefonoLimpio.substring(1);
  }

  if (telefonoLimpio.startsWith('15')) {
    telefonoLimpio = telefonoLimpio.substring(2);
  }
  
  telefonoLimpio = `549${telefonoLimpio}`;
}

    // 3. Creamos el mensaje pre-armado
    const mensajeAdmin = `¡Hola ${nombre}! Te hablo por la reserva del quincho. Te escribo para coordinar el pago para completar tu reserva.`;
    
    // 4. Generamos el link final
    const linkWhatsApp = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensajeAdmin)}`;
    
    try {
      await resend.emails.send({
        from: 'Quincho Doña Leonarda <onboarding@resend.dev>',
        to: ['quincholeonarda@gmail.com'], // 🔥 RECORDÁ PONER TU MAIL ACÁ
        subject: `🚨 Nueva Pre-Reserva: ${nombre} ${apellido} (${fechaFormat})`,
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: #ea580c;">¡Tenés una nueva solicitud de reserva!</h2>
            <p>El cliente tiene 24 horas para contactarte por WhatsApp y coordinar el pago de la seña. Si no lo hace, podés anular la reserva desde tu panel.</p>
            
            <div style="margin: 20px 0;">
                <a href="${linkWhatsApp}" style="background-color: #25D366; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    💬 Enviar WhatsApp a ${nombre}
                </a>
            </div>

            <hr style="border: 1px solid #fed7aa;" />
            <ul style="font-size: 16px; line-height: 1.6;">
              <li><strong>Cliente:</strong> ${nombre} ${apellido}</li>
              <li><strong>Teléfono:</strong> ${telefono}</li>
              <li><strong>Fecha:</strong> ${fechaFormat}</li>
              <li><strong>Turno:</strong> ${turno === 'MANANA' ? 'Mañana (7-19hs)' : turno === 'NOCHE' ? 'Noche (20-4hs)' : 'Completo (7-4hs)'}</li>
              <li><strong>Salón Extra:</strong> ${incluyeSegundoSalon ? 'Sí' : 'No'}</li>
              <li><strong>Total a cobrar:</strong> $${precio.toLocaleString('es-AR')}</li>
            </ul>
            <p style="margin-top: 20px; font-size: 12px; color: #888;">
              Esta notificación fue generada automáticamente por tu sistema.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error enviando el correo:", emailError);
    }

    return NextResponse.json({ success: true, reserva: nuevaReserva });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
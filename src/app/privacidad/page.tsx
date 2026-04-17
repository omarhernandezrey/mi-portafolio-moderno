import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  robots: { index: false, follow: true }, // No indexar en buscadores pero permitir navegación
};

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen py-24 px-6 max-w-4xl mx-auto text-[var(--text-color)]">
      <h1 className="text-4xl font-bold mb-8 text-[var(--primary-color)]">Política de Privacidad</h1>
      
      <section className="space-y-6 text-sm leading-relaxed">
        <p><strong>Última actualización:</strong> 15 de abril de 2026</p>
        
        <p>En cumplimiento de la <strong>Ley 1581 de 2012</strong> (Ley de Habeas Data) de la República de Colombia, yo, <strong>Omar Hernández Rey</strong>, informo a los usuarios de este sitio web sobre el tratamiento de sus datos personales.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Responsable del Tratamiento</h2>
        <p>El responsable del tratamiento de sus datos personales es Omar Hernández Rey, residente en Bogotá, Colombia. Puede contactarme para cualquier solicitud relacionada con sus datos a través del correo electrónico: <strong>hernandezreyomar@gmail.com</strong>.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Datos Recopilados</h2>
        <p>A través de nuestro chatbot de IA y formularios de contacto, podemos recopilar:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Nombre y apellidos.</li>
          <li>Dirección de correo electrónico.</li>
          <li>Número de teléfono (WhatsApp).</li>
          <li>Nombre de la empresa.</li>
          <li>Contenido de la conversación y detalles del proyecto solicitado.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Finalidad del Tratamiento</h2>
        <p>Sus datos serán utilizados exclusivamente para:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Responder a sus consultas y solicitudes de servicios.</li>
          <li>Generar propuestas comerciales personalizadas.</li>
          <li>Gestionar el agendado de reuniones técnicas o laborales.</li>
          <li>Mantener comunicación directa durante la ejecución de proyectos.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Transferencia a Terceros</h2>
        <p>Para la prestación del servicio, sus datos son procesados por:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Supabase</strong> (Almacenamiento de base de datos segura).</li>
          <li><strong>Google Gemini API</strong> (Procesamiento de lenguaje natural para el chat).</li>
        </ul>
        <p>No vendemos ni compartimos sus datos con fines publicitarios de terceros.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Derechos del Titular</h2>
        <p>Como titular de los datos, usted tiene derecho a:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Conocer, actualizar y rectificar sus datos personales.</li>
          <li>Solicitar la supresión de sus datos (Derecho al olvido).</li>
          <li>Revocar el consentimiento otorgado para el tratamiento.</li>
        </ul>

        <p className="mt-12 text-[var(--muted-color)] italic text-xs">Al utilizar el chatbot o el formulario de contacto, usted acepta de manera libre y voluntaria el tratamiento de sus datos bajo estos términos.</p>
      </section>
    </main>
  );
}

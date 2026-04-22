import { Resend } from 'resend';
import { serverEnv, clientEnv } from '@/config/env';

export async function sendFollowUpEmail(to: string, name: string, service: string) {
  if (!serverEnv.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not found, skipping email.');
    return null;
  }

  const resend = new Resend(serverEnv.RESEND_API_KEY);

  const subject = `¿En qué más puedo ayudarte con ${service}? — Omar Hernández`;
  
  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      <p>Hola ${name || 'allí'},</p>
      <p>Hace unos días estuvimos conversando a través de mi asistente virtual sobre tu proyecto de <strong>${service || 'desarrollo web'}</strong>.</p>
      <p>Me paso por aquí personalmente para saber si tienes alguna duda adicional o si te gustaría que agendemos una llamada corta de 15 minutos para concretar detalles.</p>
      <p>Puedes agendar directamente aquí: <a href="${clientEnv.NEXT_PUBLIC_CALCOM_CONSULT_URL}">${clientEnv.NEXT_PUBLIC_CALCOM_CONSULT_URL}</a></p>
      <p>O si prefieres, escríbeme por WhatsApp: <a href="https://wa.me/${clientEnv.NEXT_PUBLIC_WHATSAPP_NUMBER}">Chat directo</a></p>
      <br/>
      <p>¡Quedo atento!</p>
      <p>—<br/><strong>Omar Hernández Rey</strong><br/>Full Stack Developer</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Omar Hernández <onboarding@resend.dev>', // Usar dominio verificado en prod
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception sending email:', err);
    return null;
  }
}

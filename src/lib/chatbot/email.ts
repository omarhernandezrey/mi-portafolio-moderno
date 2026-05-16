import { Resend } from 'resend';
import { serverEnv, clientEnv } from '@/config/env';

export async function sendContactNotification(name: string, email: string, message: string) {
  if (!serverEnv.RESEND_API_KEY) return null;

  const resend = new Resend(serverEnv.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'Omar Hernández <contacto@omarhernandezrey.com>',
      to: ['hernandezreyomar@gmail.com'],
      replyTo: email,
      subject: `📩 Nuevo mensaje de ${name} — Formulario de contacto`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
          <h2 style="color: #00cba9;">Nuevo mensaje desde el formulario</h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr style="border:none; border-top:1px solid #eee; margin: 20px 0;" />
          <p><strong>Mensaje:</strong></p>
          <blockquote style="border-left: 4px solid #00cba9; padding-left: 16px; margin: 8px 0; color: #555;">
            ${message.replace(/\n/g, '<br/>')}
          </blockquote>
        </div>
      `,
    });
  } catch (err) {
    console.error('Error sending contact notification:', err);
  }
}

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
      from: 'Omar Hernández <contacto@omarhernandezrey.com>', // Usar dominio verificado en prod
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

export async function sendLeadMagnetFollowUp(to: string, source: string) {
  if (!serverEnv.RESEND_API_KEY) return null;

  const resend = new Resend(serverEnv.RESEND_API_KEY);
  const subject = `¿Te sirvió el recurso sobre ${source}? — Omar Hernández`;

  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      <p>Hola de nuevo,</p>
      <p>Ayer descargaste el recurso: <strong>${source}</strong>.</p>
      <p>Me paso por aquí solo para saber si pudiste leerlo y si te generó alguna duda que quieras resolver conmigo.</p>
      <p>Si estás pensando en arrancar un proyecto digital este año, me encantaría escucharte y ver si puedo aportarte valor.</p>
      <p>Puedes agendar una sesión de 15 minutos aquí: <a href="${clientEnv.NEXT_PUBLIC_CALCOM_CONSULT_URL}">${clientEnv.NEXT_PUBLIC_CALCOM_CONSULT_URL}</a></p>
      <br/>
      <p>¡Seguimos en contacto!</p>
      <p>—<br/><strong>Omar Hernández Rey</strong><br/>Full Stack Developer</p>
    </div>
  `;

  try {
    const { data } = await resend.emails.send({
      from: 'Omar Hernández <contacto@omarhernandezrey.com>',
      to: [to],
      subject,
      html,
    });
    return data;
  } catch (err) {
    console.error('Error sending magnet follow-up:', err);
    return null;
  }
}

export async function sendNewsletterConfirmation(to: string, token: string) {
  if (!serverEnv.RESEND_API_KEY) return null;

  const resend = new Resend(serverEnv.RESEND_API_KEY);
  const confirmUrl = `${clientEnv.NEXT_PUBLIC_SITE_URL}/api/newsletter/confirm?token=${token}`;

  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      <h2>¡Solo un paso más!</h2>
      <p>Gracias por querer suscribirte a mi newsletter sobre tecnología, IA y desarrollo web.</p>
      <p>Por favor, haz clic en el botón de abajo para confirmar tu suscripción:</p>
      <a href="${confirmUrl}" style="display: inline-block; background: #00cba9; color: #0d131a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Confirmar Suscripción</a>
      <p>Si no solicitaste esto, puedes ignorar este correo.</p>
      <br/>
      <p>—<br/><strong>Omar Hernández Rey</strong></p>
    </div>
  `;

  try {
    const { data } = await resend.emails.send({
      from: 'Omar Hernández <contacto@omarhernandezrey.com>',
      to: [to],
      subject: 'Confirma tu suscripción — Omar Hernández',
      html,
    });
    return data;
  } catch (err) {
    console.error('Error sending confirmation email:', err);
    return null;
  }
}

export async function sendNewsletterEdition(to: string, subject: string, htmlContent: string, subscriberId: string) {
  if (!serverEnv.RESEND_API_KEY) return null;

  const resend = new Resend(serverEnv.RESEND_API_KEY);
  const unsubscribeUrl = `${clientEnv.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?id=${subscriberId}`;

  const finalHtml = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      ${htmlContent}
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">
        Recibes este correo porque te suscribiste a la newsletter de Omar Hernández Rey.<br/>
        <a href="${unsubscribeUrl}" style="color: #999;">Darse de baja</a>
      </p>
    </div>
  `;

  try {
    const { data } = await resend.emails.send({
      from: 'Omar Hernández <contacto@omarhernandezrey.com>',
      to: [to],
      subject,
      html: finalHtml,
    });
    return data;
  } catch (err) {
    console.error(`Error sending newsletter to ${to}:`, err);
    return null;
  }
}

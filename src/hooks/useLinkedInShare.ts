// src/hooks/useLinkedInShare.ts
// ------------------------------------------------------------------
// * Hook mejorado para generar y abrir la ventana de compartir *
// ------------------------------------------------------------------

import { useCallback, useMemo } from 'react';

const buildAbsoluteUrl = (path: string, base?: string) => {
  if (!path) return base ?? '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (!base) return path;
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
};

const buildShareArticleUrl = ({
  url,
  title,
  summary,
  source,
}: {
  url: string;
  title: string;
  summary: string;
  source?: string;
}) => {
  const share = new URL('https://www.linkedin.com/shareArticle');
  share.searchParams.set('mini', 'true');
  share.searchParams.set('url', url);
  share.searchParams.set('title', title);
  share.searchParams.set('summary', summary);
  if (source) {
    share.searchParams.set('source', source);
  }
  return share.toString();
};

const truncateForLinkedIn = (text: string, maxLength = 1200) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
};

interface ProjectData {
  title: string;
  description: string;
  technologies: string[];
  repository: string;
  demo: string;
  category: string;
}

interface CertificateData {
  title: string;
  institution: string;
  duration: string;
  description: string;
  certificate?: string | null;
}

interface UseLinkedInShareProps {
  project: ProjectData;
  portfolioUrl?: string;
  authorName?: string; // Agregamos authorName como opcional
}

interface UseLinkedInCertificateShareProps {
  certificate: CertificateData;
  portfolioUrl?: string;
  authorName?: string; // Agregamos authorName como opcional
}

export const useLinkedInShare = ({ 
  project, 
  portfolioUrl = 'https://omarh-portafolio-web.vercel.app',
  authorName = 'Omar Hernández' // Valor por defecto
}: UseLinkedInShareProps) => {
  // ► Mensaje pre-generado y memoizado para evitar re-renderizados
  const linkedInMessage = useMemo(() => {
    return `🚀 ¡Nuevo proyecto en mi portafolio!
  
💼 🔍 DISPONIBLE PARA OPORTUNIDADES LABORALES COMO DESARROLLADOR WEB 🔍 💼

📋 ${project.title}
${project.description}

🛠️ Tecnologías: ${project.technologies.join(', ')}
🏷️ Categoría: ${project.category}

🔗 Demo en vivo: ${project.demo}
💻 Código en GitHub: ${project.repository}

¡Echa un vistazo a mi portafolio completo! 👨‍💻
${authorName ? `Desarrollado por: ${authorName}` : ''}

🎯 BUSCO TRABAJO COMO DESARROLLADOR WEB - ¡Contáctame si tienes una oportunidad!

#OpenToWork #WebDeveloper #HiringMe #BuscoTrabajo #WebDevelopment #${project.category.replace(/\s+/g, '')} #Portfolio #${project.technologies.map(tech => tech.replace(/\s+/g, '')).join(' #')} #Developer #Frontend #Backend #FullStack`;
  }, [project, authorName]);

  // ► URL de LinkedIn con parámetros para compartir
  const generateLinkedInUrl = useCallback(() => {
    const baseUrl = 'https://www.linkedin.com/sharing/share-offsite/';
    const params = new URLSearchParams({
      url: project.demo || portfolioUrl
    });
    return `${baseUrl}?${params.toString()}`;
  }, [project.demo, portfolioUrl]);

  // ► Función principal de compartir (estable)
  const shareToLinkedIn = useCallback(async () => {
    try {
      // 1. Intentar copiar al portapapeles
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(linkedInMessage);
        console.log('Texto copiado al portapapeles');
      }
    } catch (error) {
      console.log('No se pudo copiar al portapapeles:', error);
    }

    const sharedUrl = project.demo || portfolioUrl;
    const linkedInShareUrl = buildShareArticleUrl({
      url: sharedUrl,
      title: `${project.title} – Proyecto destacado`,
      summary: truncateForLinkedIn(linkedInMessage),
      source: authorName,
    });
    const width = 720;
    const height = 640;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const shareWindow = window.open(
      linkedInShareUrl,
      'linkedin-share',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no`
    );

    if (shareWindow) {
      shareWindow.focus();
      setTimeout(() => {
        alert(`✅ Ventana de LinkedIn abierta con el proyecto adjunto.

📋 INSTRUCCIONES:
1. Pega el texto (Ctrl+V) - ya está copiado
2. Revisa la vista previa y agrega una imagen si lo deseas
3. Publica para compartir tu disponibilidad laboral`);
      }, 1500);
    } else {
      window.location.href = linkedInShareUrl;
    }
  }, [linkedInMessage, project.demo, portfolioUrl]);

  // ► Función alternativa para copiar texto solamente
  const copyToClipboard = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(linkedInMessage);
        return true;
      }
      
      // Fallback para navegadores más antiguos
      const textArea = document.createElement('textarea');
      textArea.value = linkedInMessage;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
      return false;
    }
  }, [linkedInMessage]);

  // ► Devuelve funciones estables
  return { 
    shareToLinkedIn, 
    copyToClipboard, 
    linkedInMessage,
    linkedInUrl: generateLinkedInUrl()
  };
};

// ► Hook específico para compartir certificados
export const useLinkedInCertificateShare = ({
  certificate,
  portfolioUrl = 'https://omarh-portafolio-web.vercel.app',
  authorName = 'Omar Hernández' // Valor por defecto
}: UseLinkedInCertificateShareProps) => {
  
  // ► Mensaje específico para certificados
  const certificateMessage = useMemo(() => {
    return `🎓 ¡Nuevo certificado obtenido!

💼 🔍 DISPONIBLE PARA OPORTUNIDADES LABORALES COMO DESARROLLADOR WEB 🔍 💼

📜 ${certificate.title}
🏛️ ${certificate.institution}
📅 ${certificate.duration}

📋 Descripción:
${certificate.description}

✨ Este certificado forma parte de mi formación continua como desarrollador web, demostrando mi compromiso con el aprendizaje y la excelencia profesional.
${authorName ? `\n👨‍💻 ${authorName}` : ''}

🌐 Conoce más sobre mi formación y proyectos en: ${portfolioUrl}

🎯 BUSCO TRABAJO COMO DESARROLLADOR WEB - ¡Contáctame si tienes una oportunidad!

#OpenToWork #WebDeveloper #HiringMe #BuscoTrabajo #Certificacion #FormacionContinua #WebDevelopment #Developer #Frontend #Backend #FullStack #EducacionTecnologica #DesarrolloProfesional`;
  }, [certificate, portfolioUrl, authorName]);

  // ► Función para compartir certificado
  const certificateShareUrl = useMemo(() => {
    const preferred = certificate.certificate
      ? buildAbsoluteUrl(certificate.certificate, portfolioUrl)
      : portfolioUrl;
    return buildShareArticleUrl({
      url: preferred ?? portfolioUrl,
      title: `${certificate.title} – ${certificate.institution}`,
      summary: truncateForLinkedIn(certificateMessage),
      source: authorName,
    });
  }, [certificate.certificate, portfolioUrl, certificateMessage, certificate.title, certificate.institution, authorName]);

  const shareCertificateToLinkedIn = useCallback(async () => {
    try {
      // Copiar mensaje al portapapeles
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(certificateMessage);
        console.log('Mensaje de certificado copiado al portapapeles');
      }
    } catch (error) {
      console.log('No se pudo copiar al portapapeles:', error);
    }

    const width = 720;
    const height = 640;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const newWindow = window.open(
      certificateShareUrl,
      'linkedin-share',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no`
    );

    if (newWindow) {
      newWindow.focus();
      setTimeout(() => {
        alert(`🎓 Ventana de LinkedIn lista con tu certificado.

📋 INSTRUCCIONES:
1. Pega el texto (Ctrl+V) - ya está copiado
2. Verifica la vista previa (ya contiene el enlace adjunto)
3. ¡Publica y destaca tu nueva certificación!`);
      }, 1200);
    } else {
      window.location.href = certificateShareUrl;
    }
  }, [certificateMessage, certificateShareUrl]);

  // ► Función para copiar solo el mensaje
  const copyCertificateToClipboard = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(certificateMessage);
        return true;
      }
      
      const textArea = document.createElement('textarea');
      textArea.value = certificateMessage;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    } catch (error) {
      console.error('Error copiando certificado al portapapeles:', error);
      return false;
    }
  }, [certificateMessage]);

  return {
    shareCertificateToLinkedIn,
    copyCertificateToClipboard,
    certificateMessage
  };
};

// src/hooks/useLinkedInShare.ts
// ------------------------------------------------------------------
// * Hook mejorado para generar y abrir la ventana de compartir *
// ------------------------------------------------------------------

import { useCallback, useMemo } from 'react';

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
  authorName?: string;
}

interface UseLinkedInCertificateShareProps {
  certificate: CertificateData;
  portfolioUrl?: string;
  authorName?: string;
}

export const useLinkedInShare = ({ 
  project, 
  portfolioUrl = 'https://omarh-portafolio-web.vercel.app',
  authorName: _authorName = 'Omar Hernández'
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

🎯 BUSCO TRABAJO COMO DESARROLLADOR WEB - ¡Contáctame si tienes una oportunidad!

#OpenToWork #WebDeveloper #HiringMe #BuscoTrabajo #WebDevelopment #${project.category.replace(/\s+/g, '')} #Portfolio #${project.technologies.map(tech => tech.replace(/\s+/g, '')).join(' #')} #Developer #Frontend #Backend #FullStack`;
  }, [project]);

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

    // 2. Abrir LinkedIn directamente en el feed principal (mantiene todas las opciones)
    const linkedinUrl = 'https://www.linkedin.com/feed/';
    
    // Abrir en nueva pestaña
    const newWindow = window.open(linkedinUrl, '_blank');

    if (newWindow) {
      newWindow.focus();
      
      // Mostrar instrucciones después de un momento
      setTimeout(() => {
        alert(`✅ LinkedIn abierto en nueva pestaña!

📋 INSTRUCCIONES:
1. Haz clic en "Empezar una publicación"
2. Pega el texto (Ctrl+V) - ya está copiado
3. Agrega imagen usando las opciones de LinkedIn
4. ¡Publica y muestra que buscas trabajo!

💡 El mensaje incluye que buscas trabajo como desarrollador web.`);
      }, 1500);
    }
  }, [linkedInMessage]);

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
  authorName: _authorName = 'Omar Hernández'
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

🌐 Conoce más sobre mi formación y proyectos en: ${portfolioUrl}

🎯 BUSCO TRABAJO COMO DESARROLLADOR WEB - ¡Contáctame si tienes una oportunidad!

#OpenToWork #WebDeveloper #HiringMe #BuscoTrabajo #Certificacion #FormacionContinua #WebDevelopment #Developer #Frontend #Backend #FullStack #EducacionTecnologica #DesarrolloProfesional`;
  }, [certificate, portfolioUrl]);

  // ► Función para compartir certificado
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

    // Abrir LinkedIn
    const linkedinUrl = 'https://www.linkedin.com/feed/';
    const newWindow = window.open(linkedinUrl, '_blank');

    if (newWindow) {
      newWindow.focus();
      
      setTimeout(() => {
        alert(`🎓 ¡LinkedIn abierto para compartir tu certificado!

📋 INSTRUCCIONES:
1. Haz clic en "Empezar una publicación"
2. Pega el texto (Ctrl+V) - ya está copiado
3. Agrega imagen de tu certificado con las opciones de LinkedIn
4. ¡Muestra tu nueva certificación y que buscas trabajo!

💡 El mensaje incluye todos los detalles del certificado y que buscas trabajo.`);
      }, 1500);
    }
  }, [certificateMessage]);

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
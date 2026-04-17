export * from './persona';
export * from './catalog';
export * from './salesPlaybook';
export * from './objections';

// Importamos los datos reales del portafolio
import { projectsData } from '../../projectsData';
import { educationData } from '../../educationData';
import { skillsData } from '../../skillsData';
import { servicesData } from '../../servicesData';

/**
 * SOURCE OF TRUTH CONSOLIDADA
 * Estos objetos unifican los datos estáticos del portafolio con la lógica del bot.
 */
export const PORTFOLIO_DATA = {
  projects: projectsData,
  education: educationData,
  skills: skillsData,
  baseServices: servicesData
};

/**
 * HELPER: Busca un proyecto por título (útil para responder dudas técnicas)
 */
export const getProjectByTitle = (title: string) => {
  return projectsData.find(p => p.title.es.toLowerCase().includes(title.toLowerCase()) || 
                                p.title.en.toLowerCase().includes(title.toLowerCase()));
};

/**
 * HELPER: Filtra habilidades por categoría
 */
export const getSkillsByCategory = (category: string) => {
  return skillsData.filter(s => s.category.es.toLowerCase().includes(category.toLowerCase()) || 
                                s.category.en.toLowerCase().includes(category.toLowerCase()));
};

export * from './persona';
export * from './catalog';
export * from './salesPlaybook';
export * from './objections';

// Importamos los datos reales del portafolio (corregido)
import { projectsData } from '../../projectsData';
import { educationData } from '../../educationData';
import { skillsData } from '../../skillsData';

export const PORTFOLIO_DATA = {
  projects: projectsData,
  education: educationData,
  skills: skillsData
};

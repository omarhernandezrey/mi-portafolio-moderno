import { projectsData, type Project } from '@/lib/projectsData';

export interface KnowledgeEntry {
  id: string;
  content: string;
  metadata: {
    title: string;
    link?: string;
  };
}

function projectToEntry(project: Project): KnowledgeEntry {
  const title = project.title.es;
  const content = [
    `Proyecto: ${title}`,
    `Categoría: ${project.category.es}`,
    `Descripción: ${project.description.es}`,
    `Tecnologías: ${project.technologies.join(', ')}`,
  ].join('\n').trim();

  return {
    id: title.toLowerCase().replace(/\s+/g, '-'),
    content,
    metadata: { title, link: project.demo },
  };
}

export const knowledgeBase: KnowledgeEntry[] = projectsData.map(projectToEntry);

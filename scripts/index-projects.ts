import { projectsData } from '../src/lib/projectsData';
import { indexProject } from '../src/lib/chatbot/rag';

/**
 * Script para indexar todos los proyectos en la base de datos vectorial.
 * Ejecutar con: npx tsx scripts/index-projects.ts
 */
async function main() {
  console.log('🚀 Iniciando indexación de proyectos...');

  for (const project of projectsData) {
    // Estructura basada en src/lib/projectsData.ts
    const titleEs = project.title.es;
    const descEs = project.description.es;
    const techs = Array.isArray(project.technologies) ? project.technologies.join(', ') : '';
    
    // Construir un texto rico para el embedding
    const content = `
      Proyecto: ${titleEs}
      Categoría: ${project.category.es}
      Descripción: ${descEs}
      Tecnologías: ${techs}
    `.trim();

    const projectId = titleEs.toLowerCase().replace(/\s+/g, '-');

    console.log(`- Indexando: ${titleEs}...`);
    const success = await indexProject(projectId, content, { 
      title: titleEs,
      link: project.demo 
    });

    if (success) {
      console.log(`  ✅ OK`);
    } else {
      console.log(`  ❌ Falló`);
    }
  }

  console.log('\n✨ Proceso terminado.');
}

main().catch(console.error);

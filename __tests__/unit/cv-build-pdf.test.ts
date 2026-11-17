/**
 * `buildCvPdf` (T-22): produce un PDF real a partir de `DatosCv`. Se
 * verifica con `pdf-lib` mismo (cargando el PDF generado), no solo
 * comprobando los primeros bytes.
 */
import { PDFDocument } from 'pdf-lib';
import { buildCvPdf } from '@/lib/cv/buildCvPdf';
import type { DatosCv } from '@/lib/cv/gatherCvData';

function datosBase(overrides: Partial<DatosCv> = {}): DatosCv {
  return {
    nombre: 'Omar Hernández Rey',
    titular: 'Ingeniero de Software',
    resumen: 'Resumen real y corto.',
    contacto: {
      email: 'omar@test.com',
      github: 'https://github.com/omarhernandezrey',
      linkedin: 'https://linkedin.com/in/omarhernandezrey',
      ubicacion: 'Bogotá, CO',
      sitio: 'https://omarhernandezrey.com',
    },
    skills: [{ nombre: 'React', porcentaje: 95 }],
    proyectos: [{ titulo: 'Mi Proyecto', descripcion: 'Una descripción real.', tecnologias: ['React', 'Next.js'] }],
    cursos: [{ titulo: 'Curso real', institucion: 'Institución real' }],
    ...overrides,
  };
}

describe('buildCvPdf', () => {
  it('produce un PDF válido que pdf-lib puede volver a cargar', async () => {
    const bytes = await buildCvPdf(datosBase());
    const cargado = await PDFDocument.load(bytes);
    expect(cargado.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it('empieza con la cabecera %PDF', async () => {
    const bytes = await buildCvPdf(datosBase());
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-');
  });

  it('con contenido mínimo: una sola página', async () => {
    const bytes = await buildCvPdf(datosBase());
    const cargado = await PDFDocument.load(bytes);
    expect(cargado.getPageCount()).toBe(1);
  });

  it('con mucho contenido real: salta de página sin lanzar', async () => {
    const datos = datosBase({
      resumen: 'Resumen largo. '.repeat(60),
      proyectos: Array.from({ length: 6 }, (_, i) => ({
        titulo: `Proyecto ${i}`,
        descripcion: 'Descripción larga repetida varias veces. '.repeat(15),
        tecnologias: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
      })),
    });
    const bytes = await buildCvPdf(datos);
    const cargado = await PDFDocument.load(bytes);
    expect(cargado.getPageCount()).toBeGreaterThan(1);
  });

  it('caracteres fuera de WinAnsi (p. ej. un guion largo o emoji) no rompen la generación', async () => {
    const datos = datosBase({ resumen: 'Texto con guion largo — y emoji 🚀 de verdad.' });
    await expect(buildCvPdf(datos)).resolves.toBeInstanceOf(Uint8Array);
  });

  it('sin skills/proyectos/cursos: igual genera un PDF válido (secciones vacías se omiten, no se inventan)', async () => {
    const bytes = await buildCvPdf(datosBase({ skills: [], proyectos: [], cursos: [] }));
    const cargado = await PDFDocument.load(bytes);
    expect(cargado.getPageCount()).toBe(1);
  });

  it('el título del documento incluye el nombre real', async () => {
    const bytes = await buildCvPdf(datosBase());
    const cargado = await PDFDocument.load(bytes);
    expect(cargado.getTitle()).toContain('Omar Hernández Rey');
  });
});

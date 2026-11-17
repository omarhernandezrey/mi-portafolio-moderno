/**
 * Dibuja el PDF del CV (T-22) a partir de `DatosCv` (todo ya real, ver
 * `gatherCvData.ts`). Mismo patrón que el PDF de la calculadora
 * (`/api/calculator`): `pdf-lib` con fuentes estándar, sin incrustar, y
 * `pdfSafe()` en cada cadena que viene de contenido real (puede traer
 * comillas tipográficas, guiones largos, etc. que WinAnsi no acepta sueltos).
 */
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import { pdfSafe } from '@/lib/pdf/sanitize';
import type { DatosCv } from './gatherCvData';

const ANCHO_PAGINA = 612;
const ALTO_PAGINA = 792;
const MARGEN = 50;
const MARGEN_INFERIOR = 60;
const ANCHO_UTIL = ANCHO_PAGINA - MARGEN * 2;

const AZUL_MARCA = rgb(0.06, 0.4, 0.7);
const GRIS_TEXTO = rgb(0.2, 0.2, 0.2);
const GRIS_CLARO = rgb(0.45, 0.45, 0.45);

interface Fuentes {
  bold: PDFFont;
  regular: PDFFont;
}

/** Cursor mutable: dónde dibujar la siguiente línea, con salto de página automático. */
interface Cursor {
  doc: PDFDocument;
  pagina: PDFPage;
  y: number;
  fuentes: Fuentes;
}

function nuevaPagina(doc: PDFDocument): PDFPage {
  return doc.addPage([ANCHO_PAGINA, ALTO_PAGINA]);
}

function asegurarEspacio(cursor: Cursor, alturaNecesaria: number): void {
  if (cursor.y - alturaNecesaria < MARGEN_INFERIOR) {
    cursor.pagina = nuevaPagina(cursor.doc);
    cursor.y = ALTO_PAGINA - MARGEN;
  }
}

function escribir(
  cursor: Cursor,
  texto: string,
  opts: { size: number; font?: PDFFont; color?: ReturnType<typeof rgb>; x?: number; espacioDespues?: number },
): void {
  const { size, font = cursor.fuentes.regular, color = GRIS_TEXTO, x = MARGEN, espacioDespues = size * 0.6 } = opts;
  asegurarEspacio(cursor, size);
  cursor.pagina.drawText(pdfSafe(texto), { x, y: cursor.y, size, font, color });
  cursor.y -= size + espacioDespues;
}

/** Envuelve un párrafo largo a `ANCHO_UTIL`, línea por línea (pdf-lib no envuelve texto solo). */
function escribirParrafo(cursor: Cursor, texto: string, opts: { size: number; font?: PDFFont }): void {
  const { size, font = cursor.fuentes.regular } = opts;
  const palabras = pdfSafe(texto).split(' ');
  let linea = '';
  const anchoMaximo = ANCHO_UTIL;

  for (const palabra of palabras) {
    const candidata = linea ? `${linea} ${palabra}` : palabra;
    if (font.widthOfTextAtSize(candidata, size) > anchoMaximo && linea) {
      escribir(cursor, linea, { size, font, espacioDespues: size * 0.3 });
      linea = palabra;
    } else {
      linea = candidata;
    }
  }
  if (linea) escribir(cursor, linea, { size, font, espacioDespues: size * 0.3 });
}

function tituloSeccion(cursor: Cursor, texto: string): void {
  cursor.y -= 6;
  asegurarEspacio(cursor, 20);
  cursor.pagina.drawLine({
    start: { x: MARGEN, y: cursor.y + 4 },
    end: { x: ANCHO_PAGINA - MARGEN, y: cursor.y + 4 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  escribir(cursor, texto.toUpperCase(), { size: 12, font: cursor.fuentes.bold, color: AZUL_MARCA, espacioDespues: 8 });
}

export async function buildCvPdf(datos: DatosCv): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`CV — ${datos.nombre}`);
  doc.setAuthor(datos.nombre);

  const fuentes: Fuentes = {
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    regular: await doc.embedFont(StandardFonts.Helvetica),
  };

  const cursor: Cursor = { doc, pagina: nuevaPagina(doc), y: ALTO_PAGINA - MARGEN, fuentes };

  // Encabezado: nombre, titular (T-22: "Ingeniero de Software" primero, no el jobTitle SEO) y contacto.
  escribir(cursor, datos.nombre, { size: 22, font: fuentes.bold, espacioDespues: 4 });
  escribir(cursor, datos.titular, { size: 14, font: fuentes.bold, color: AZUL_MARCA, espacioDespues: 10 });
  escribir(
    cursor,
    `${datos.contacto.email}  ·  ${datos.contacto.ubicacion}  ·  ${datos.contacto.sitio}`,
    { size: 9, color: GRIS_CLARO },
  );
  escribir(cursor, `${datos.contacto.github}  ·  ${datos.contacto.linkedin}`, { size: 9, color: GRIS_CLARO, espacioDespues: 14 });

  // Resumen
  if (datos.resumen) {
    tituloSeccion(cursor, 'Resumen');
    escribirParrafo(cursor, datos.resumen, { size: 10 });
    cursor.y -= 6;
  }

  // Skills
  if (datos.skills.length > 0) {
    tituloSeccion(cursor, 'Habilidades técnicas');
    const linea = datos.skills.map((s) => `${s.nombre} (${s.porcentaje}%)`).join('   ·   ');
    escribirParrafo(cursor, linea, { size: 10 });
    cursor.y -= 6;
  }

  // Proyectos
  if (datos.proyectos.length > 0) {
    tituloSeccion(cursor, 'Proyectos destacados');
    for (const p of datos.proyectos) {
      asegurarEspacio(cursor, 14);
      escribir(cursor, p.titulo, { size: 11, font: fuentes.bold, espacioDespues: 2 });
      if (p.descripcion) escribirParrafo(cursor, p.descripcion, { size: 9.5 });
      if (p.tecnologias.length > 0) {
        escribir(cursor, p.tecnologias.join(' · '), { size: 8.5, color: GRIS_CLARO, espacioDespues: 10 });
      } else {
        cursor.y -= 6;
      }
    }
  }

  // Cursos / certificaciones destacadas
  if (datos.cursos.length > 0) {
    tituloSeccion(cursor, 'Formación y certificaciones destacadas');
    for (const c of datos.cursos) {
      escribir(cursor, `${c.titulo} — ${c.institucion}`, { size: 9.5, espacioDespues: 4 });
    }
  }

  return doc.save();
}

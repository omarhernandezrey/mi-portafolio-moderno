/**
 * `rutaInternaSegura` — guarda contra redirección abierta.
 *
 * Nació de un defecto real encontrado en la auditoría de backend: las dos
 * rutas de vista previa (y `auth/callback`) validaban el `?next=` por
 * prefijos (`startsWith('/')` + `!startsWith('//')`). `/\evil.com` pasa esas
 * dos comprobaciones y `new URL('/\\evil.com', origin)` resuelve a
 * `https://evil.com/`, porque el parser de URL trata `\` como `/` al
 * normalizar la autoridad. `preview/disable` además no pide sesión, así que
 * el salto era alcanzable por cualquiera.
 *
 * Los casos de escape de abajo no son hipótesis: son los que se comprobaron
 * contra el parser real antes de escribir el arreglo.
 */
import { rutaInternaSegura } from '@/lib/rutaInterna';

const ORIGEN = 'https://omarhernandezrey.com';

describe('rutaInternaSegura — rutas internas legítimas', () => {
  it('conserva la ruta, la query y el hash', () => {
    expect(rutaInternaSegura('/admin', ORIGEN)).toBe('/admin');
    expect(rutaInternaSegura('/es/blog?page=2', ORIGEN)).toBe('/es/blog?page=2');
    expect(rutaInternaSegura('/es#contacto', ORIGEN)).toBe('/es#contacto');
  });

  it('usa el valor por defecto cuando no hay destino', () => {
    expect(rutaInternaSegura(null, ORIGEN)).toBe('/');
    expect(rutaInternaSegura(undefined, ORIGEN)).toBe('/');
    expect(rutaInternaSegura('', ORIGEN)).toBe('/');
    // `auth/callback` usa /admin como destino propio
    expect(rutaInternaSegura(null, ORIGEN, '/admin')).toBe('/admin');
  });

  it('acepta una URL absoluta del MISMO origen y la devuelve relativa', () => {
    // Devolverla relativa evita que quien la use la concatene a otro origen.
    expect(rutaInternaSegura(`${ORIGEN}/admin/proyectos`, ORIGEN)).toBe('/admin/proyectos');
  });
});

describe('rutaInternaSegura — intentos de salir del sitio', () => {
  // El caso que motivó el arreglo: pasaba la validación anterior.
  it('rechaza la barra invertida (el defecto real encontrado)', () => {
    expect(rutaInternaSegura('/\\evil.com', ORIGEN)).toBe('/');
    expect(rutaInternaSegura('/\\/evil.com', ORIGEN)).toBe('/');
  });

  it('rechaza las formas clásicas de redirección abierta', () => {
    expect(rutaInternaSegura('//evil.com', ORIGEN)).toBe('/');
    expect(rutaInternaSegura('https://evil.com', ORIGEN)).toBe('/');
    expect(rutaInternaSegura('http://evil.com/phishing', ORIGEN)).toBe('/');
    expect(rutaInternaSegura('//evil.com/\\@omarhernandezrey.com', ORIGEN)).toBe('/');
  });

  it('rechaza otro esquema aunque el texto empiece por /', () => {
    expect(rutaInternaSegura('javascript:alert(1)', ORIGEN)).toBe('/');
    expect(rutaInternaSegura('data:text/html,<script>', ORIGEN)).toBe('/');
  });

  it('rechaza un subdominio parecido, no solo un dominio distinto', () => {
    // El fallo típico de validar con `includes(dominio)` en vez del origen.
    expect(rutaInternaSegura('https://omarhernandezrey.com.evil.com/x', ORIGEN)).toBe('/');
    expect(rutaInternaSegura('https://evil.omarhernandezrey.com/x', ORIGEN)).toBe('/');
  });

  it('distingue el puerto y el esquema como parte del origen', () => {
    expect(rutaInternaSegura('http://omarhernandezrey.com/x', ORIGEN)).toBe('/');
    expect(rutaInternaSegura('https://omarhernandezrey.com:8443/x', ORIGEN)).toBe('/');
  });

  it('no revienta con un origen inválido: cae al valor por defecto', () => {
    expect(rutaInternaSegura('/admin', 'no-es-una-url')).toBe('/');
  });
});

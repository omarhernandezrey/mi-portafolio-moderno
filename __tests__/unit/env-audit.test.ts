import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  PROYECTO_SUPABASE_ESPERADO,
  auditarEntorno,
  comprobarSupabase,
  nombresDelEsquema,
  nombresExpandidosEnShell,
  nombresLeidosPorElCodigo,
  parsearEnv,
  sinValores,
  usoEnWorkflows,
  type EntradaDeAuditoria,
} from '@/lib/env/audit';

const RAIZ = process.cwd();

function jwt(carga: Record<string, unknown>): string {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(carga)}.firma`;
}

const entradaBase: EntradaDeAuditoria = {
  locales: [],
  ejemplo: [],
  codigo: [],
  shell: [],
  obligatorias: [],
  ci: { definidas: [], consumidas: [] },
};

describe('parsearEnv', () => {
  const texto = [
    '# comentario',
    '',
    'SIMPLE=valor',
    'export EXPORTADA="con espacios"',
    "COMILLAS='a#b'",
    'CON_COMENTARIO=valor # nota',
    'VACIA=',
    'VACIA_COMILLAS=""',
    'PLANTILLA=your-api-key-here',
    'no es una variable',
  ].join('\n');
  const variables = parsearEnv(texto, '.env.local');
  const de = (nombre: string) => variables.find((v) => v.nombre === nombre);

  it('ignora comentarios, líneas vacías y líneas que no son asignaciones', () => {
    expect(variables.map((v) => v.nombre)).toEqual([
      'SIMPLE',
      'EXPORTADA',
      'COMILLAS',
      'CON_COMENTARIO',
      'VACIA',
      'VACIA_COMILLAS',
      'PLANTILLA',
    ]);
  });

  it('quita comillas y comentarios de final de línea, y respeta # dentro de comillas', () => {
    expect(de('EXPORTADA')?.valor).toBe('con espacios');
    expect(de('COMILLAS')?.valor).toBe('a#b');
    expect(de('CON_COMENTARIO')?.valor).toBe('valor');
  });

  it('distingue vacías y textos de plantilla', () => {
    expect(de('VACIA')?.vacia).toBe(true);
    expect(de('VACIA_COMILLAS')?.vacia).toBe(true);
    expect(de('SIMPLE')?.vacia).toBe(false);
    expect(de('PLANTILLA')?.marcador).toBe(true);
    expect(de('SIMPLE')?.marcador).toBe(false);
  });

  it('sinValores no deja pasar ningún valor', () => {
    const limpio = sinValores(parsearEnv('SECRETO=valor-que-no-debe-salir', '.env'));
    expect(JSON.stringify(limpio)).not.toContain('valor-que-no-debe-salir');
    expect(limpio).toEqual([{ archivo: '.env', nombre: 'SECRETO', vacia: false, marcador: false }]);
  });
});

describe('lectura de nombres en el código', () => {
  it('reconoce el acceso con punto y con corchetes, sin las variables de plataforma', () => {
    const codigo = `
      const a = process.env.UNA_CLAVE;
      const b = process.env['OTRA_CLAVE'] ?? process.env["TERCERA"];
      if (process.env.NODE_ENV === 'production' && process.env.VERCEL_URL) {}
    `;
    expect(nombresLeidosPorElCodigo(codigo)).toEqual(['OTRA_CLAVE', 'TERCERA', 'UNA_CLAVE']);
  });

  it('reconoce las expansiones de shell', () => {
    expect(nombresExpandidosEnShell('curl -H "Bearer $CRON_SECRET" "${SITE_URL}/api" $x')).toEqual([
      'CRON_SECRET',
      'SITE_URL',
    ]);
  });

  it('separa obligatorias y opcionales del esquema zod', () => {
    const esquema = `const s = z.object({
      A_OBLIGATORIA: z.string().min(1),
      B_OPCIONAL: z.string().optional(),
    });`;
    expect(nombresDelEsquema(esquema)).toEqual({ obligatorias: ['A_OBLIGATORIA'], opcionales: ['B_OPCIONAL'] });
  });
});

describe('usoEnWorkflows', () => {
  const workflow = `
    env:
      SOLO_TRASLADADA: \${{ secrets.SOLO_TRASLADADA }}
      LITERAL: test-key
      RENOMBRADA: \${{ secrets.ORIGEN }}
      USADA_EN_SHELL: \${{ secrets.USADA_EN_SHELL }}
    run: |
      curl -H "Authorization: Bearer $USADA_EN_SHELL" https://x
      echo "\${{ secrets.EN_LINEA }}"
  `;
  const uso = usoEnWorkflows(workflow);

  it('lista todo lo que el workflow define o pide', () => {
    expect(uso.definidas).toEqual(['EN_LINEA', 'LITERAL', 'ORIGEN', 'RENOMBRADA', 'SOLO_TRASLADADA', 'USADA_EN_SHELL']);
  });

  it('da por consumido solo lo que un paso usa, no lo que se limita a trasladar', () => {
    expect(uso.consumidas).toEqual(['EN_LINEA', 'ORIGEN', 'USADA_EN_SHELL']);
  });
});

describe('auditarEntorno', () => {
  const local = (nombre: string, extra: Partial<{ vacia: boolean; marcador: boolean; archivo: string }> = {}) => ({
    archivo: '.env.local',
    nombre,
    vacia: false,
    marcador: false,
    ...extra,
  });

  it('señala lo que sobra, lo que falta y lo que está vacío', () => {
    const informe = auditarEntorno({
      ...entradaBase,
      locales: [local('LEIDA'), local('HUERFANA'), local('SIN_VALOR', { vacia: true }), local('NODE_ENV')],
      codigo: ['LEIDA', 'AUSENTE', 'SIN_VALOR'],
      obligatorias: ['LEIDA', 'AUSENTE', 'SIN_VALOR'],
    });
    expect(informe.sobranEnLocal).toEqual(['HUERFANA']);
    expect(informe.faltanEnLocal).toEqual(['AUSENTE']);
    expect(informe.vaciasEnLocal).toEqual(['SIN_VALOR']);
    expect(informe.obligatoriasSinValor).toEqual(['AUSENTE', 'SIN_VALOR']);
  });

  it('acepta el alias NEXT_PUBLIC_ de las variables de Supabase', () => {
    const informe = auditarEntorno({
      ...entradaBase,
      locales: [local('NEXT_PUBLIC_SUPABASE_URL'), local('NEXT_PUBLIC_SUPABASE_ANON_KEY')],
      codigo: ['SUPABASE_URL', 'SUPABASE_ANON_KEY'],
      obligatorias: ['SUPABASE_URL', 'SUPABASE_ANON_KEY'],
    });
    expect(informe.faltanEnLocal).toEqual([]);
    expect(informe.obligatoriasSinValor).toEqual([]);
  });

  it('una vacía en un archivo no cuenta si otro archivo le da valor', () => {
    const informe = auditarEntorno({
      ...entradaBase,
      locales: [local('CLAVE', { vacia: true, archivo: '.env' }), local('CLAVE')],
      codigo: ['CLAVE'],
      obligatorias: ['CLAVE'],
    });
    expect(informe.vaciasEnLocal).toEqual([]);
    expect(informe.obligatoriasSinValor).toEqual([]);
    expect(informe.duplicadas).toEqual([]);
  });

  it('detecta repetidas dentro del mismo archivo y textos de plantilla', () => {
    const informe = auditarEntorno({
      ...entradaBase,
      locales: [local('DOBLE'), local('DOBLE'), local('RELLENO', { marcador: true })],
      codigo: ['DOBLE', 'RELLENO'],
    });
    expect(informe.duplicadas).toEqual(['DOBLE']);
    expect(informe.conMarcador).toEqual(['RELLENO']);
  });

  it('cruza el código con .env.example y con los workflows', () => {
    const informe = auditarEntorno({
      ...entradaBase,
      ejemplo: ['DOCUMENTADA', 'SOLO_EN_EJEMPLO', 'DE_SHELL'],
      codigo: ['DOCUMENTADA', 'SIN_DOCUMENTAR'],
      shell: ['DE_SHELL'],
      ci: {
        definidas: ['DOCUMENTADA', 'RESTO_DEL_CHATBOT', 'CONSUMIDA', 'CLOUDFLARE_ACCOUNT_ID'],
        consumidas: ['CONSUMIDA'],
      },
    });
    expect(informe.sinDocumentar).toEqual(['SIN_DOCUMENTAR']);
    expect(informe.documentadasSinUso).toEqual(['SOLO_EN_EJEMPLO']);
    expect(informe.ciSinUso).toEqual(['RESTO_DEL_CHATBOT']);
  });
});

describe('comprobarSupabase', () => {
  const ref = PROYECTO_SUPABASE_ESPERADO;
  const url = `https://${ref}.supabase.co`;
  const futuro = Math.floor(Date.now() / 1000) + 3600;
  const veredictos = (valores: Record<string, string>) =>
    Object.fromEntries(comprobarSupabase(valores).map((c) => [c.que, c.veredicto]));

  it('da por bueno un entorno coherente', () => {
    const anon = jwt({ ref, role: 'anon', exp: futuro });
    const comprobaciones = comprobarSupabase({
      SUPABASE_URL: url,
      NEXT_PUBLIC_SUPABASE_URL: url,
      SUPABASE_ANON_KEY: anon,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
      SUPABASE_SERVICE_ROLE_KEY: jwt({ ref, role: 'service_role', exp: futuro }),
    });
    expect(comprobaciones).toHaveLength(7);
    expect(comprobaciones.every((c) => c.veredicto === 'ok')).toBe(true);
  });

  it('detecta una URL de otro proyecto y una pareja que no coincide', () => {
    const v = veredictos({ SUPABASE_URL: 'https://otroproyecto.supabase.co', NEXT_PUBLIC_SUPABASE_URL: url });
    expect(v['SUPABASE_URL apunta al proyecto del portafolio']).toBe('fallo');
    expect(v['NEXT_PUBLIC_SUPABASE_URL apunta al proyecto del portafolio']).toBe('ok');
    expect(v['SUPABASE_URL = NEXT_PUBLIC_SUPABASE_URL']).toBe('fallo');
  });

  it('detecta claves intercambiadas, de otro proyecto y caducadas', () => {
    const detalle = (valores: Record<string, string>) => comprobarSupabase(valores).find((c) => c.veredicto === 'fallo')?.detalle;
    expect(detalle({ SUPABASE_ANON_KEY: jwt({ ref, role: 'service_role', exp: futuro }) })).toContain('rol');
    expect(detalle({ SUPABASE_SERVICE_ROLE_KEY: jwt({ ref: 'viejo', role: 'service_role', exp: futuro }) })).toContain('otro proyecto');
    expect(detalle({ SUPABASE_ANON_KEY: jwt({ ref, role: 'anon', exp: 1 }) })).toContain('caducada');
    expect(detalle({ SUPABASE_ANON_KEY: 'cualquier-cosa' })).toContain('no es un JWT');
  });

  it('acepta las claves de formato nuevo y rechaza la del tipo contrario', () => {
    expect(veredictos({ SUPABASE_ANON_KEY: 'sb_publishable_abc' })['SUPABASE_ANON_KEY es una clave «anon» de este proyecto']).toBe('no-aplica');
    expect(veredictos({ SUPABASE_ANON_KEY: 'sb_secret_abc' })['SUPABASE_ANON_KEY es una clave «anon» de este proyecto']).toBe('fallo');
  });

  it('ningún veredicto arrastra un valor', () => {
    const secreta = jwt({ ref: 'viejo', role: 'anon', exp: futuro });
    const salida = JSON.stringify(
      comprobarSupabase({
        SUPABASE_URL: 'https://proyectosecreto.supabase.co',
        SUPABASE_ANON_KEY: secreta,
        SUPABASE_SERVICE_ROLE_KEY: 'valor-en-claro',
      }),
    );
    expect(salida).not.toContain('proyectosecreto');
    expect(salida).not.toContain(secreta);
    expect(salida).not.toContain('valor-en-claro');
  });
});

describe('guardarraíl: el repositorio documenta lo que lee', () => {
  const codigo = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
  const recorrer = (dir: string): string[] =>
    readdirSync(dir).flatMap((nombre) => {
      const ruta = join(dir, nombre);
      if (statSync(ruta).isDirectory()) return recorrer(ruta);
      return codigo.test(nombre) ? [ruta] : [];
    });
  const leidas = nombresLeidosPorElCodigo(
    [...recorrer(join(RAIZ, 'src')), ...recorrer(join(RAIZ, 'scripts'))].map((r) => readFileSync(r, 'utf8')).join('\n'),
  );
  const ejemplo = parsearEnv(readFileSync(join(RAIZ, '.env.example'), 'utf8'), '.env.example');

  it('toda variable que lee el código está en .env.example', () => {
    const documentadas = new Set(ejemplo.map((v) => v.nombre));
    expect(leidas.filter((n) => !documentadas.has(n))).toEqual([]);
  });

  it('.env.example no documenta variables que nadie lee', () => {
    const shell = nombresExpandidosEnShell(
      readdirSync(join(RAIZ, 'scripts'))
        .filter((n) => n.endsWith('.sh'))
        .map((n) => readFileSync(join(RAIZ, 'scripts', n), 'utf8'))
        .join('\n'),
    );
    const usadas = new Set([...leidas, ...shell]);
    expect(ejemplo.map((v) => v.nombre).filter((n) => !usadas.has(n))).toEqual([]);
  });

  it('.env.example no trae el valor de ningún secreto', () => {
    const secretos = ejemplo.filter((v) => /(KEY|SECRET|TOKEN|PASSWORD)/.test(v.nombre) && !/^NEXT_PUBLIC_/.test(v.nombre));
    expect(secretos.length).toBeGreaterThan(0);
    expect(secretos.filter((v) => !v.vacia && !v.marcador).map((v) => v.nombre)).toEqual([]);
  });

  it('las obligatorias del esquema están documentadas', () => {
    const { obligatorias } = nombresDelEsquema(readFileSync(join(RAIZ, 'src', 'config', 'env.ts'), 'utf8'));
    const documentadas = new Set(ejemplo.map((v) => v.nombre));
    expect(obligatorias.length).toBeGreaterThan(0);
    expect(obligatorias.filter((n) => !documentadas.has(n))).toEqual([]);
  });
});

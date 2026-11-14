/**
 * El visor de proyectos no se modifica.
 *
 * `src/components/shared/Card.tsx` muestra cada proyecto funcionando dentro de
 * tres dispositivos, con iframes cuya geometría está ajustada a mano píxel a
 * píxel. Es una restricción del propietario (PLAN_MAESTRO_DASHBOARD.md §2 y
 * DESIGN.md): ninguna tarea puede cambiar su marcado ni sus estilos. Lo único
 * que puede cambiar es de dónde recibe los datos, y eso ocurre fuera de este
 * archivo.
 *
 * Este test fija la huella del archivo para que la restricción se cumpla
 * también en CI, no solo cuando alguien corre `npm run verify`. Si falla, se
 * revierte el cambio en Card.tsx; la huella solo se actualiza con autorización
 * expresa de Omar.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const HUELLA_AUTORIZADA =
  '88b3858a65c5381ee2850f36bec9dab5612f120a8c995bcab5ead79b7b15a91e';

describe('visor de proyectos', () => {
  it('src/components/shared/Card.tsx no ha cambiado', () => {
    const contenido = readFileSync(
      join(__dirname, '..', '..', 'src/components/shared/Card.tsx'),
    );
    const huella = createHash('sha256').update(contenido).digest('hex');
    expect(huella).toBe(HUELLA_AUTORIZADA);
  });
});

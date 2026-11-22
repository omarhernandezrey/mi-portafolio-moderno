/**
 * @jest-environment jsdom
 */

/**
 * Contrato de reinicio de los nueve `*FormDialog` de portfolio.
 *
 * Hasta ahora NINGUNO tenía prueba. Estos diálogos escriben en la base, y el
 * comportamiento que hay que preservar no es evidente leyendo el JSX: al
 * abrirse, el formulario tiene que mostrar los valores de `initial` y NO los
 * que quedaron de la vez anterior. Hoy eso lo garantiza un `useEffect` que
 * sincroniza props → estado; la alternativa es remontar con `key`.
 *
 * Estas pruebas se escribieron y se pasaron ANTES de tocar los diálogos, para
 * que midan el comportamiento real y no la implementación nueva.
 */
import React from 'react';

/**
 * Se sustituye SOLO el primitivo `Dialog`. Los `Input`, `Select` y
 * `AdminButton` siguen siendo los de verdad, igual que toda la lógica del
 * formulario: lo que se prueba es el estado del formulario, no el portal de
 * Headless UI. Hace falta porque el `Dialog` de Headless UI no vuelve a
 * montar su panel tras cerrarse en jsdom, y cerrar y reabrir es justo el
 * recorrido que hay que medir.
 */
jest.mock('@/components/admin/ui', () => {
  const real = jest.requireActual('@/components/admin/ui');
  return {
    ...real,
    Dialog: ({
      open,
      children,
      footer,
    }: {
      open: boolean;
      children?: React.ReactNode;
      footer?: React.ReactNode;
    }) => (open ? <div>{children}{footer}</div> : null),
  };
});

import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BadgeFormDialog } from '@/components/admin/portfolio/BadgeFormDialog';
import { EducationCategoryFormDialog } from '@/components/admin/portfolio/EducationCategoryFormDialog';
import { EducationItemFormDialog } from '@/components/admin/portfolio/EducationItemFormDialog';
import { InterestFormDialog } from '@/components/admin/portfolio/InterestFormDialog';
import { ProjectFormDialog } from '@/components/admin/portfolio/ProjectFormDialog';
import { ServiceFormDialog } from '@/components/admin/portfolio/ServiceFormDialog';
import { SkillFormDialog } from '@/components/admin/portfolio/SkillFormDialog';
import { TechnologyFormDialog } from '@/components/admin/portfolio/TechnologyFormDialog';
import { TimelineFormDialog } from '@/components/admin/portfolio/TimelineFormDialog';

// Headless UI observa el disparador con floating-ui incluso cerrado.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver =
    ResizeObserverMock;
});

afterEach(cleanup);

const bi = (es: string) => ({ es, en: `${es} (en)` });

/**
 * Un caso por diálogo: el componente, dos `initial` distintos y la etiqueta
 * del campo de texto por el que se comprueba. `campo` siempre apunta a un
 * valor NO bilingüe (slug / nombre / título), que es el que identifica la
 * fila y el más fácil de leer en una aserción.
 */
type Caso = {
  nombre: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Dialogo: React.ComponentType<any>;
  campo: string;
  a: { initial: Record<string, unknown>; valor: string };
  b: { initial: Record<string, unknown>; valor: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propsExtra?: Record<string, any>;
  vacio: string;
};

const CASOS: Caso[] = [
  {
    nombre: 'BadgeFormDialog',
    Dialogo: BadgeFormDialog,
    campo: 'Slug',
    a: {
      initial: {
        slug: 'git-github',
        title: bi('Git y GitHub'),
        institution: bi('IBM'),
        summary: null,
        logo: null,
        certificate_url: null,
        is_new: true,
      },
      valor: 'git-github',
    },
    b: {
      initial: {
        slug: 'docker-basico',
        title: bi('Docker'),
        institution: null,
        summary: null,
        logo: null,
        certificate_url: null,
        is_new: false,
      },
      valor: 'docker-basico',
    },
    vacio: '',
  },
  {
    nombre: 'EducationCategoryFormDialog',
    Dialogo: EducationCategoryFormDialog,
    campo: 'Slug',
    a: { initial: { slug: 'backend', name: bi('Backend') }, valor: 'backend' },
    b: { initial: { slug: 'frontend', name: bi('Frontend') }, valor: 'frontend' },
    vacio: '',
  },
  {
    nombre: 'EducationItemFormDialog',
    Dialogo: EducationItemFormDialog,
    campo: 'Slug',
    propsExtra: {
      categorias: [
        { id: 'cat-1', label: 'Backend' },
        { id: 'cat-2', label: 'Frontend' },
      ],
    },
    a: {
      initial: {
        category_id: 'cat-1',
        slug: 'symfony-bd',
        title: bi('Bases de Datos en Symfony'),
        institution: bi('Platzi'),
        duration: null,
        description: null,
        logo: null,
        certificate_url: null,
        is_new: false,
      },
      valor: 'symfony-bd',
    },
    b: {
      initial: {
        category_id: 'cat-2',
        slug: 'csharp-limpio',
        title: bi('Código Limpio en C#'),
        institution: bi('Platzi'),
        duration: null,
        description: null,
        logo: null,
        certificate_url: null,
        is_new: false,
      },
      valor: 'csharp-limpio',
    },
    vacio: '',
  },
  {
    nombre: 'InterestFormDialog',
    Dialogo: InterestFormDialog,
    campo: 'Título',
    a: {
      initial: { title: 'Ajedrez', href: 'https://lichess.org', iconKey: 'react' },
      valor: 'Ajedrez',
    },
    b: {
      initial: { title: 'Ciclismo', href: 'https://strava.com', iconKey: 'react' },
      valor: 'Ciclismo',
    },
    vacio: '',
  },
  {
    nombre: 'ProjectFormDialog',
    Dialogo: ProjectFormDialog,
    campo: 'Slug',
    a: {
      initial: {
        slug: 'shopi',
        title: bi('Shopi'),
        description: bi('E-commerce'),
        category: null,
        technologies: ['react'],
        repository: 'https://github.com/x/shopi',
        demo: 'https://shopi.dev',
        image_url: null,
      },
      valor: 'shopi',
    },
    b: {
      initial: {
        slug: 'todo-app',
        title: bi('TODO App'),
        description: bi('Gestor de tareas'),
        category: null,
        technologies: [],
        repository: '',
        demo: '',
        image_url: null,
      },
      valor: 'todo-app',
    },
    vacio: '',
  },
  {
    nombre: 'ServiceFormDialog',
    Dialogo: ServiceFormDialog,
    campo: 'Slug',
    a: {
      initial: {
        slug: 'web-corporativa',
        title: bi('Web corporativa'),
        description: null,
        icon: null,
        badge: null,
        features: null,
        gradient: null,
        price_min: null,
        price_max: null,
        price_currency: null,
      },
      valor: 'web-corporativa',
    },
    b: {
      initial: {
        slug: 'app-movil',
        title: bi('App móvil'),
        description: null,
        icon: null,
        badge: null,
        features: null,
        gradient: null,
        price_min: null,
        price_max: null,
        price_currency: null,
      },
      valor: 'app-movil',
    },
    vacio: '',
  },
  {
    nombre: 'SkillFormDialog',
    Dialogo: SkillFormDialog,
    campo: 'Slug',
    a: {
      initial: {
        slug: 'typescript',
        name: bi('TypeScript'),
        percentage: 90,
        color_hex: null,
        icon: null,
        description: null,
        category: null,
      },
      valor: 'typescript',
    },
    b: {
      initial: {
        slug: 'postgresql',
        name: bi('PostgreSQL'),
        percentage: 75,
        color_hex: null,
        icon: null,
        description: null,
        category: null,
      },
      valor: 'postgresql',
    },
    vacio: '',
  },
  {
    nombre: 'TechnologyFormDialog',
    Dialogo: TechnologyFormDialog,
    campo: 'Nombre',
    a: {
      initial: { name: 'Next.js', icon_key: null, color: null, category: null },
      valor: 'Next.js',
    },
    b: {
      initial: { name: 'Vue.js', icon_key: null, color: null, category: null },
      valor: 'Vue.js',
    },
    vacio: '',
  },
  {
    nombre: 'TimelineFormDialog',
    Dialogo: TimelineFormDialog,
    campo: 'Slug',
    a: {
      initial: {
        slug: 'primer-empleo',
        year: bi('2020'),
        title: bi('Primer empleo'),
        description: null,
        icon_key: null,
      },
      valor: 'primer-empleo',
    },
    b: {
      initial: {
        slug: 'freelance',
        year: bi('2022'),
        title: bi('Freelance'),
        description: null,
        icon_key: null,
      },
      valor: 'freelance',
    },
    vacio: '',
  },
];

describe.each(CASOS)(
  '$nombre — contrato de reinicio al abrir',
  ({ Dialogo, campo, a, b, propsExtra, vacio }) => {
    const base = { onClose: jest.fn(), onSubmit: jest.fn(), ...propsExtra };

    function leerCampo(): HTMLInputElement {
      return screen.getByLabelText(new RegExp(`^${campo}`, 'i')) as HTMLInputElement;
    }

    it('al abrir muestra los valores de initial', () => {
      render(<Dialogo {...base} open initial={a.initial} />);
      expect(leerCampo().value).toBe(a.valor);
    });

    it('al abrir sin initial muestra el formulario vacío', () => {
      render(<Dialogo {...base} open initial={null} />);
      expect(leerCampo().value).toBe(vacio);
    });

    it('descarta lo escrito: cerrar y reabrir vuelve a los valores de initial', async () => {
      const { rerender } = render(<Dialogo {...base} open initial={a.initial} />);

      await userEvent.clear(leerCampo());
      await userEvent.type(leerCampo(), 'texto-a-medias');
      expect(leerCampo().value).toBe('texto-a-medias');

      // Cerrar es exactamente lo que hace la página: open=false e initial=null.
      rerender(<Dialogo {...base} open={false} initial={null} />);
      rerender(<Dialogo {...base} open initial={a.initial} />);

      expect(leerCampo().value).toBe(a.valor);
    });

    it('editar otra fila sin cerrar antes muestra la fila nueva, no la anterior', () => {
      const { rerender } = render(<Dialogo {...base} open initial={a.initial} />);
      expect(leerCampo().value).toBe(a.valor);

      rerender(<Dialogo {...base} open={false} initial={null} />);
      rerender(<Dialogo {...base} open initial={b.initial} />);

      expect(leerCampo().value).toBe(b.valor);
    });

    it('reabrir en modo «nuevo» tras haber editado no arrastra la fila editada', () => {
      const { rerender } = render(<Dialogo {...base} open initial={a.initial} />);
      expect(leerCampo().value).toBe(a.valor);

      rerender(<Dialogo {...base} open={false} initial={null} />);
      rerender(<Dialogo {...base} open initial={null} />);

      expect(leerCampo().value).toBe(vacio);
    });
  }
);

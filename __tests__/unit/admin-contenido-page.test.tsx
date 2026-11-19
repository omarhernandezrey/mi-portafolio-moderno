/**
 * @jest-environment jsdom
 */

/**
 * Página de Contenido (T-12, copia el patrón de `admin-educacion-page.test.tsx`):
 * cuatro pestañas — Servicios, Tecnologías, Timeline, Perfil —, las tres
 * primeras con el CRUD + reorden + publicar de siempre, y Perfil con su
 * propio patrón (un solo PUT que reemplaza el array de intereses entero,
 * sin id por elemento).
 */
import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ToastProvider } from '@/components/ui/Toast';
import AdminContenidoPage from '@/app/admin/(dashboard)/contenido/page';

const mockAdminFetch = jest.fn();
jest.mock('@/lib/admin/client-fetch', () => {
  const actual = jest.requireActual('@/lib/admin/client-fetch');
  return { ...actual, adminFetch: (...args: unknown[]) => mockAdminFetch(...args) };
});

function servicio(overrides: Partial<Record<string, unknown>> = {}) {
  return { id: 'svc-1', slug: 'sitios-web', title: { es: 'Sitios Web' }, description: null, icon: null, badge: 'WEB', features: null, gradient: null, price_min: null, price_max: null, price_currency: null, position: 0, is_published: true, ...overrides };
}

function tecnologia(overrides: Partial<Record<string, unknown>> = {}) {
  return { id: 'tech-1', name: 'React', icon_key: 'FaReact', color: '#61DAFB', category: 'Frontend', position: 0, is_published: true, ...overrides };
}

function hito(overrides: Partial<Record<string, unknown>> = {}) {
  return { id: 'hito-1', slug: 'hito-1', year: { es: '2024' }, title: { es: 'Primer hito' }, description: null, icon_key: 'Sparkles', position: 0, is_published: true, ...overrides };
}

function perfilInteres(overrides: Partial<Record<string, unknown>> = {}) {
  return { title: 'Open Source', href: 'https://opensource.org/', iconKey: 'Globe', ...overrides };
}

function mockCargaInicial(
  servicios: unknown[] = [],
  tecnologias: unknown[] = [],
  hitos: unknown[] = [],
  perfil: { content: unknown[]; is_published: boolean } = { content: [], is_published: true },
) {
  mockAdminFetch
    .mockResolvedValueOnce(servicios)
    .mockResolvedValueOnce(tecnologias)
    .mockResolvedValueOnce(hitos)
    .mockResolvedValueOnce(perfil);
}

function renderPagina() {
  return render(
    <ToastProvider>
      <AdminContenidoPage />
    </ToastProvider>,
  );
}

function tabla() {
  return within(screen.getByRole('table'));
}

function irATab(nombre: string) {
  fireEvent.click(screen.getByRole('tab', { name: new RegExp(`^${nombre}`) }));
}

beforeEach(() => {
  mockAdminFetch.mockReset();
});

describe('carga inicial', () => {
  it('carga las cuatro fuentes en paralelo y muestra Servicios primero', async () => {
    mockCargaInicial([servicio()]);
    renderPagina();

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(tabla().getByText('Sitios Web')).toBeInTheDocument();
    expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/services');
    expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/technologies');
    expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/timeline');
    expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/profile/interests');
  });

  it('un fallo de red muestra un estado de error con reintentar', async () => {
    mockAdminFetch.mockRejectedValueOnce(new Error('Error 500'));
    renderPagina();
    expect(await screen.findByText('No se pudo cargar el contenido')).toBeInTheDocument();

    mockCargaInicial([servicio()]);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });
});

describe('servicios — crear, publicar, reordenar, borrar', () => {
  it('crea un servicio', async () => {
    mockCargaInicial();
    renderPagina();
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(4));

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo servicio' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Nuevo servicio' });
    fireEvent.change(within(dialogo).getByLabelText('Slug', { exact: false }), { target: { value: 'sitios-web' } });
    fireEvent.change(within(dialogo).getByLabelText('Título (es)', { exact: false }), { target: { value: 'Sitios Web' } });

    mockAdminFetch.mockResolvedValueOnce(servicio());
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    expect(tabla().getByText('Sitios Web')).toBeInTheDocument();
    // El cuerpo mandado ya viene transformado: features en null si no se escribió ninguna línea.
    expect(mockAdminFetch).toHaveBeenCalledWith(
      '/api/admin/portfolio/services',
      expect.objectContaining({ method: 'POST', body: expect.stringContaining('"features":null') }),
    );
  });

  it('publicar/despublicar revierte si falla', async () => {
    mockCargaInicial([servicio({ is_published: true })]);
    renderPagina();
    await screen.findByRole('table');

    const interruptor = tabla().getByRole('switch', { name: 'Publicar Sitios Web' });
    expect(interruptor).toHaveAttribute('aria-checked', 'true');
    mockAdminFetch.mockRejectedValueOnce(new Error('falló'));
    fireEvent.click(interruptor);
    expect(interruptor).toHaveAttribute('aria-checked', 'false');
    await waitFor(() => expect(interruptor).toHaveAttribute('aria-checked', 'true'));
  });

  it('reordenar sube el segundo servicio a primero', async () => {
    mockCargaInicial([servicio({ id: 's1', slug: 'uno', title: { es: 'Uno' } }), servicio({ id: 's2', slug: 'dos', title: { es: 'Dos' } })]);
    renderPagina();
    await screen.findByRole('table');

    mockAdminFetch.mockResolvedValueOnce({ success: true });
    fireEvent.click(tabla().getByRole('button', { name: 'Subir Dos' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith(
        '/api/admin/portfolio/services/reorder',
        expect.objectContaining({ body: JSON.stringify({ ids: ['s2', 's1'] }) }),
      ),
    );
  });

  it('confirmar un borrado manda el DELETE y quita la fila', async () => {
    mockCargaInicial([servicio()]);
    renderPagina();
    await screen.findByRole('table');

    fireEvent.click(tabla().getByRole('button', { name: 'Eliminar Sitios Web' }));
    const confirmacion = await screen.findByRole('dialog', { name: 'Eliminar servicio' });
    mockAdminFetch.mockResolvedValueOnce({ success: true });
    fireEvent.click(within(confirmacion).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/services/svc-1', expect.objectContaining({ method: 'DELETE' })),
    );
  });
});

describe('tecnologías — crear eligiendo la clave de icono', () => {
  it('crea una tecnología', async () => {
    mockCargaInicial();
    renderPagina();
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(4));
    irATab('Tecnologías');

    fireEvent.click(screen.getByRole('button', { name: 'Nueva tecnología' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Nueva tecnología' });
    fireEvent.change(within(dialogo).getByLabelText('Nombre', { exact: false }), { target: { value: 'Vue.js' } });
    fireEvent.change(within(dialogo).getByLabelText('Clave de icono'), { target: { value: 'FaReact' } });

    mockAdminFetch.mockResolvedValueOnce(tecnologia({ id: 't-vue', name: 'Vue.js' }));
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    expect(tabla().getByText('Vue.js')).toBeInTheDocument();
  });
});

describe('timeline — crear, borrar', () => {
  it('crea un hito', async () => {
    mockCargaInicial();
    renderPagina();
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(4));
    irATab('Timeline');

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo hito' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Nuevo hito' });
    fireEvent.change(within(dialogo).getByLabelText('Slug', { exact: false }), { target: { value: 'hito-1' } });
    fireEvent.change(within(dialogo).getByLabelText('Año (es)', { exact: false }), { target: { value: '2024' } });
    fireEvent.change(within(dialogo).getByLabelText('Título (es)', { exact: false }), { target: { value: 'Primer hito' } });

    mockAdminFetch.mockResolvedValueOnce(hito());
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    expect(tabla().getByText('Primer hito')).toBeInTheDocument();
  });
});

describe('perfil — intereses sin id por elemento', () => {
  it('crea un interés: manda el array completo por PUT', async () => {
    mockCargaInicial();
    renderPagina();
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(4));
    irATab('Perfil');

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo interés' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Nuevo interés' });
    fireEvent.change(within(dialogo).getByLabelText('Título', { exact: false }), { target: { value: 'Open Source' } });
    fireEvent.change(within(dialogo).getByLabelText('Enlace', { exact: false }), { target: { value: 'https://opensource.org/' } });
    fireEvent.change(within(dialogo).getByLabelText('Icono'), { target: { value: 'Globe' } });

    mockAdminFetch.mockResolvedValueOnce({ content: [perfilInteres()], is_published: true });
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith(
        '/api/admin/portfolio/profile/interests',
        expect.objectContaining({ method: 'PUT', body: JSON.stringify({ content: [perfilInteres()], is_published: true }) }),
      ),
    );
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(tabla().getByText('Open Source')).toBeInTheDocument();
  });

  it('despublicar toda la sección manda is_published:false con el array intacto', async () => {
    mockCargaInicial([], [], [], { content: [perfilInteres()], is_published: true });
    renderPagina();
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(4));
    irATab('Perfil');

    const interruptor = await screen.findByRole('switch', { name: 'Mostrar la sección de intereses' });
    expect(interruptor).toBeChecked();

    mockAdminFetch.mockResolvedValueOnce({ content: [perfilInteres()], is_published: false });
    fireEvent.click(interruptor);

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith(
        '/api/admin/portfolio/profile/interests',
        expect.objectContaining({ body: JSON.stringify({ content: [perfilInteres()], is_published: false }) }),
      ),
    );
  });

  it('si el PUT falla, el interruptor de la sección vuelve a su estado anterior (no se queda en un estado a medias)', async () => {
    mockCargaInicial([], [], [], { content: [perfilInteres()], is_published: true });
    renderPagina();
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(4));
    irATab('Perfil');

    const interruptor = await screen.findByRole('switch', { name: 'Mostrar la sección de intereses' });
    expect(interruptor).toBeChecked();

    mockAdminFetch.mockRejectedValueOnce(new Error('Error 500'));
    fireEvent.click(interruptor);

    await waitFor(() => expect(interruptor).toBeChecked());
  });

  it('confirmar el borrado de un interés manda el array sin ese elemento', async () => {
    mockCargaInicial([], [], [], { content: [perfilInteres(), perfilInteres({ title: 'AI & ML', iconKey: 'BrainCircuit' })], is_published: true });
    renderPagina();
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(4));
    irATab('Perfil');
    await screen.findByRole('table');

    fireEvent.click(tabla().getByRole('button', { name: 'Eliminar Open Source' }));
    const confirmacion = await screen.findByRole('dialog', { name: 'Eliminar interés' });
    mockAdminFetch.mockResolvedValueOnce({ content: [perfilInteres({ title: 'AI & ML', iconKey: 'BrainCircuit' })], is_published: true });
    fireEvent.click(within(confirmacion).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith(
        '/api/admin/portfolio/profile/interests',
        expect.objectContaining({ body: JSON.stringify({ content: [perfilInteres({ title: 'AI & ML', iconKey: 'BrainCircuit' })], is_published: true }) }),
      ),
    );
  });
});

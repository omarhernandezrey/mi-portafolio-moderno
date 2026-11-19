/**
 * @jest-environment jsdom
 */

/**
 * AdminNav (T-08): el cajón móvil (abrir/cerrar, Escape, foco) y el
 * interruptor de área Portafolio/Negocio no se rompieron al introducir
 * `area`. `framer-motion` se sustituye por un paso directo sin animación:
 * en jsdom no hay nada que ganar simulando la transición, y así la prueba
 * no depende de temporizadores de spring.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

const mockSignOut = jest.fn().mockResolvedValue({ error: null });
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { signOut: mockSignOut } }),
}));

jest.mock('framer-motion', () => {
  const stripMotionProps = ({ initial, animate, exit, transition, ...rest }: Record<string, unknown>) => rest;
  return {
    motion: {
      div: ({ children, ...props }: Record<string, unknown>) => (
        <div {...stripMotionProps(props)}>{children as React.ReactNode}</div>
      ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

import AdminNav from '@/components/admin/AdminNav';

beforeEach(() => {
  mockUsePathname.mockReturnValue('/admin');
  mockSignOut.mockClear();
});

describe('AdminNav — cajón móvil', () => {
  it('empieza cerrado y se abre al pulsar el botón de menú', () => {
    render(<AdminNav role="owner" userEmail="omar@example.com" />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú de administración' }));

    expect(screen.getByRole('dialog', { name: 'Navegación de administración' })).toBeInTheDocument();
  });

  it('se cierra con el botón de cerrar y devuelve el foco al botón de abrir', async () => {
    render(<AdminNav role="owner" userEmail="omar@example.com" />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú de administración' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar menú de administración' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Abrir menú de administración' })).toHaveFocus()
    );
  });

  it('se cierra con Escape', () => {
    render(<AdminNav role="owner" userEmail="omar@example.com" />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú de administración' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('al abrirse, mueve el foco dentro del cajón (al botón de cerrar)', async () => {
    render(<AdminNav role="owner" userEmail="omar@example.com" />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú de administración' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Cerrar menú de administración' })).toHaveFocus()
    );
  });

  it('un enlace de navegación dentro del cajón también lo cierra', () => {
    mockUsePathname.mockReturnValue('/admin/negocio');
    render(<AdminNav role="owner" userEmail="omar@example.com" />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú de administración' }));
    const dialog = screen.getByRole('dialog');
    const enlaceLeads = within(dialog).getAllByRole('link', { name: /Leads/i })[0];
    fireEvent.click(enlaceLeads);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('AdminNav — interruptor de área', () => {
  it('en /admin muestra la pestaña Portafolio activa y solo sus destinos', () => {
    mockUsePathname.mockReturnValue('/admin');
    render(<AdminNav role="owner" userEmail="omar@example.com" />);

    const pestañaPortafolio = screen.getAllByRole('link', { name: 'Portafolio' })[0];
    expect(pestañaPortafolio).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: /^Leads$/ })).not.toBeInTheDocument();
  });

  it('en /admin/negocio muestra la pestaña Negocio activa y sus destinos (p. ej. Leads)', () => {
    mockUsePathname.mockReturnValue('/admin/negocio');
    render(<AdminNav role="owner" userEmail="omar@example.com" />);

    const pestañaNegocio = screen.getAllByRole('link', { name: 'Negocio' })[0];
    expect(pestañaNegocio).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('link', { name: /^Leads$/ }).length).toBeGreaterThan(0);
  });

  it('un viewer en Negocio no ve destinos solo-owner (p. ej. Facturación)', () => {
    mockUsePathname.mockReturnValue('/admin/negocio');
    render(<AdminNav role="viewer" userEmail="omar@example.com" />);

    expect(screen.queryByRole('link', { name: /Facturación/ })).not.toBeInTheDocument();
  });

  it('el buscador de leads no aparece en Portafolio (no tiene nada que buscar todavía)', () => {
    mockUsePathname.mockReturnValue('/admin');
    render(<AdminNav role="owner" userEmail="omar@example.com" />);

    expect(screen.queryByLabelText('Buscar leads')).not.toBeInTheDocument();
  });

  it('el buscador de leads sí aparece en Negocio', () => {
    mockUsePathname.mockReturnValue('/admin/negocio');
    render(<AdminNav role="owner" userEmail="omar@example.com" />);

    expect(screen.getAllByLabelText('Buscar leads').length).toBeGreaterThan(0);
  });
});

describe('AdminNav — grupo Sistema transversal (T-32)', () => {
  it('en Portafolio también se ven los destinos de Sistema (antes solo vivían en Negocio)', () => {
    mockUsePathname.mockReturnValue('/admin');
    render(<AdminNav role="owner" userEmail="omar@example.com" />);

    expect(screen.getAllByRole('link', { name: /Webhooks/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Logs de API/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Ayuda/ }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: /^Docs$/ })).not.toBeInTheDocument();
  });

  it('en Negocio siguen viéndose los mismos destinos de Sistema', () => {
    mockUsePathname.mockReturnValue('/admin/negocio');
    render(<AdminNav role="owner" userEmail="omar@example.com" />);

    expect(screen.getAllByRole('link', { name: /Webhooks/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Ayuda/ }).length).toBeGreaterThan(0);
  });

  it('los dos "Resumen" se distinguen por nombre: «Resumen del portafolio» y «Resumen de negocio»', () => {
    mockUsePathname.mockReturnValue('/admin');
    render(<AdminNav role="owner" userEmail="omar@example.com" />);
    expect(screen.getAllByRole('link', { name: /Resumen del portafolio/ }).length).toBeGreaterThan(0);

    mockUsePathname.mockReturnValue('/admin/negocio');
    render(<AdminNav role="owner" userEmail="omar@example.com" />);
    expect(screen.getAllByRole('link', { name: /Resumen de negocio/ }).length).toBeGreaterThan(0);
  });
});

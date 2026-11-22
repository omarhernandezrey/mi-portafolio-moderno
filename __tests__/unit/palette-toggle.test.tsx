/**
 * @jest-environment jsdom
 */

/**
 * Cubre PaletteToggle después de mover `applyPalette` y la lista de clases a
 * nivel de módulo (hallazgo `react-hooks/immutability`: la función se llamaba
 * desde el efecto antes de estar declarada). Lo que se protege aquí es el
 * contrato observable: qué clase queda en <html> y qué se guarda, con las
 * diez paletas en el mismo orden.
 */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaletteToggle from '@/components/ui/PaletteToggle';

const CLASES = [
  '',
  'palette2',
  'palette3',
  'palette4',
  'palette5',
  'palette6',
  'palette7',
  'palette8',
  'palette9',
  'palette10',
];

function clasesDePaletaActivas(): string[] {
  return Array.from(document.documentElement.classList).filter((c) =>
    CLASES.includes(c)
  );
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.className = '';
});

describe('PaletteToggle', () => {
  it('sin nada guardado arranca en la paleta por defecto, sin clase', () => {
    render(<PaletteToggle />);
    expect(clasesDePaletaActivas()).toEqual([]);
  });

  it('aplica la paleta guardada al montar', () => {
    localStorage.setItem('paletteIndex', '4');
    render(<PaletteToggle />);
    expect(clasesDePaletaActivas()).toEqual(['palette5']);
  });

  it('cada clic avanza una paleta y la persiste', async () => {
    render(<PaletteToggle />);
    const boton = screen.getByRole('button', {
      name: 'Cambiar Paleta de Colores',
    });

    await userEvent.click(boton);
    expect(clasesDePaletaActivas()).toEqual(['palette2']);
    expect(localStorage.getItem('paletteIndex')).toBe('1');

    await userEvent.click(boton);
    expect(clasesDePaletaActivas()).toEqual(['palette3']);
    expect(localStorage.getItem('paletteIndex')).toBe('2');
  });

  it('nunca deja dos clases de paleta a la vez', async () => {
    render(<PaletteToggle />);
    const boton = screen.getByRole('button', {
      name: 'Cambiar Paleta de Colores',
    });

    for (let i = 0; i < CLASES.length; i += 1) {
      await userEvent.click(boton);
      expect(clasesDePaletaActivas().length).toBeLessThanOrEqual(1);
    }
  });

  it('da la vuelta a la primera tras las diez paletas', async () => {
    localStorage.setItem('paletteIndex', String(CLASES.length - 1));
    render(<PaletteToggle />);
    expect(clasesDePaletaActivas()).toEqual(['palette10']);

    await userEvent.click(
      screen.getByRole('button', { name: 'Cambiar Paleta de Colores' })
    );
    expect(clasesDePaletaActivas()).toEqual([]);
    expect(localStorage.getItem('paletteIndex')).toBe('0');
  });
});

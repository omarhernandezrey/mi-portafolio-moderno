/**
 * @jest-environment jsdom
 */

/**
 * T-29: objetivo táctil mínimo de 44px (CLAUDE.md, sin negociación). Antes
 * `AdminButton` tamaño `sm` quedaba en ~32px real y `Pagination` en ~36px.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import Pagination from '@/components/admin/ui/Pagination';

describe('AdminButton — 44px en las dos tallas (T-29)', () => {
  it('sm lleva min-h-11', () => {
    render(<AdminButton size="sm">Pequeño</AdminButton>);
    expect(screen.getByRole('button', { name: 'Pequeño' }).className).toContain('min-h-11');
  });

  it('md lleva min-h-11', () => {
    render(<AdminButton size="md">Mediano</AdminButton>);
    expect(screen.getByRole('button', { name: 'Mediano' }).className).toContain('min-h-11');
  });
});

describe('Pagination — enlaces de 44px (T-29)', () => {
  it('«Anterior» y «Siguiente» llevan min-h-11', () => {
    render(
      <Pagination page={2} totalPages={3} total={30} pageSize={10} basePath="/admin/leads" />,
    );
    expect(screen.getByRole('link', { name: /Anterior/ }).className).toContain('min-h-11');
    expect(screen.getByRole('link', { name: /Siguiente/ }).className).toContain('min-h-11');
  });
});

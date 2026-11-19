/**
 * @jest-environment jsdom
 */

/**
 * T-30: `PriorityBadge` consolida el `PRIORITY_META` + markup que estaba
 * clonado entre tickets/page.tsx (tarjeta móvil y fila de tabla) y
 * negocio/page.tsx.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import PriorityBadge from '@/components/admin/ui/PriorityBadge';

describe('PriorityBadge (T-30)', () => {
  it.each([
    ['urgent', 'Urgente', 'text-admin-danger'],
    ['high', 'Alta', 'text-admin-warning'],
    ['medium', 'Media', 'text-admin-info'],
    ['low', 'Baja', 'text-text-muted'],
  ])('%s → «%s» con el token %s', (priority, label, token) => {
    render(<PriorityBadge priority={priority} />);
    const badge = screen.getByText(label);
    expect(badge.className).toContain(token);
  });

  it('una prioridad desconocida cae a "Baja", no revienta', () => {
    render(<PriorityBadge priority="inexistente" />);
    expect(screen.getByText('Baja')).toBeInTheDocument();
  });

  it('compact aplica el espaciado ceñido de negocio/page.tsx', () => {
    render(<PriorityBadge priority="low" compact />);
    expect(screen.getByText('Baja').className).toContain('shrink-0');
  });
});

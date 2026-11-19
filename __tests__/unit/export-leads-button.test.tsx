/**
 * @jest-environment jsdom
 */

/**
 * T-28: "Exportar CSV (N)" sugería exportar el total, pero `leads` aquí es
 * solo la página actual (paginada en `getLeads`). El botón ahora dice la
 * verdad de su alcance.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ToastProvider } from '@/components/ui/Toast';
import ExportLeadsButton from '@/components/admin/ExportLeadsButton';
import type { Lead } from '@/lib/admin/types';

function lead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: '1',
    name: 'Ada',
    email: 'ada@example.com',
    phone: null,
    company: null,
    type: 'client',
    service_requested: null,
    budget: null,
    timeline: null,
    status: 'new',
    created_at: '2026-11-17T00:00:00Z',
    ...overrides,
  } as Lead;
}

describe('ExportLeadsButton — alcance honesto (T-28)', () => {
  it('dice "Exportar página", no "Exportar CSV" (que sugería el total)', () => {
    render(
      <ToastProvider>
        <ExportLeadsButton leads={[lead()]} />
      </ToastProvider>,
    );

    expect(screen.getByRole('button', { name: 'Exportar página (1)' })).toBeInTheDocument();
    expect(screen.queryByText(/Exportar CSV/)).not.toBeInTheDocument();
  });
});

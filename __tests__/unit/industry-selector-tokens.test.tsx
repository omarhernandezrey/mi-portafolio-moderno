/**
 * @jest-environment jsdom
 */

/**
 * T-30: `IndustrySelector` pintaba el estado con `emerald-*`/`amber-*`
 * crudos de Tailwind, fuera de las 10 paletas. Ahora usa los tokens de
 * estado `admin-success`/`admin-warning`.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ToastProvider } from '@/components/ui/Toast';
import IndustrySelector from '@/components/admin/IndustrySelector';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

describe('IndustrySelector — tokens de estado (T-30)', () => {
  it('con industria asignada: admin-success, nunca emerald', () => {
    render(
      <ToastProvider>
        <IndustrySelector leadId="lead-1" currentIndustry="startup" canEdit={false} />
      </ToastProvider>,
    );
    const texto = screen.getByText('Startup / MVP');
    expect(texto.className).toContain('text-admin-success');
    expect(texto.className).not.toMatch(/emerald/);
  });

  it('sin industria asignada: admin-warning, nunca amber', () => {
    render(
      <ToastProvider>
        <IndustrySelector leadId="lead-1" canEdit={false} />
      </ToastProvider>,
    );
    const texto = screen.getByText('Sin industria asignada');
    expect(texto.className).toContain('text-admin-warning');
    expect(texto.className).not.toMatch(/amber/);
  });
});

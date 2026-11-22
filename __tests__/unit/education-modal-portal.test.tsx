/**
 * @jest-environment jsdom
 */

/**
 * Cubre el contenedor del portal de EducationModal, que pasó de un ref leído
 * durante el render a estado (hallazgo `react-hooks/refs`). Sin estas pruebas
 * la reestructuración no tenía red: no había ningún test funcional del modal,
 * y los 1034 existentes seguían en verde aunque dejara de abrir.
 */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EducationModal from '@/components/ui/EducationModal';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (clave: string) => clave }),
}));

jest.mock('@/hooks/useLinkedInShare', () => ({
  useLinkedInCertificateShare: () => ({
    copyCertificateToClipboard: jest.fn().mockResolvedValue(true),
  }),
}));

jest.mock('@/components/ui/NotyfProvider', () => ({
  useNotyf: () => ({ error: jest.fn(), success: jest.fn() }),
}));

const PROPS = {
  title: 'Ingeniería de Sistemas',
  institution: 'Universidad Nacional',
  duration: '2015 — 2020',
  description: 'Formación en desarrollo de software.',
  logo: '/images/logo.png',
};

afterEach(() => {
  cleanup();
  document.getElementById('modal-root')?.remove();
});

describe('EducationModal — contenedor del portal', () => {
  it('crea #modal-root en el body y pinta el contenido dentro', () => {
    render(<EducationModal isOpen onClose={jest.fn()} {...PROPS} />);

    const raiz = document.getElementById('modal-root');
    expect(raiz).not.toBeNull();
    expect(raiz?.parentElement).toBe(document.body);

    // El título existe Y está dentro del portal, no del árbol del componente:
    // es lo que se rompía si el contenedor llegaba tarde al render.
    const titulo = screen.getByRole('heading', { name: PROPS.title });
    expect(raiz?.contains(titulo)).toBe(true);
  });

  it('reutiliza un #modal-root existente en vez de crear otro', () => {
    const previo = document.createElement('div');
    previo.id = 'modal-root';
    document.body.appendChild(previo);

    render(<EducationModal isOpen onClose={jest.fn()} {...PROPS} />);

    expect(document.querySelectorAll('#modal-root')).toHaveLength(1);
    expect(previo.textContent).toContain(PROPS.institution);
  });

  it('cierra con Escape y con el botón de cierre', async () => {
    const onClose = jest.fn();
    render(<EducationModal isOpen onClose={onClose} {...PROPS} />);

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);

    await userEvent.click(
      screen.getByRole('button', { name: 'education.closeModal' })
    );
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('con isOpen en false no deja el contenido visible', () => {
    render(<EducationModal isOpen={false} onClose={jest.fn()} {...PROPS} />);

    expect(screen.queryByRole('heading', { name: PROPS.title })).toBeNull();
  });
});

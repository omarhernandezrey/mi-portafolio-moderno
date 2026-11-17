/**
 * @jest-environment jsdom
 */

/**
 * T-30: `RowReorderActions` reemplaza el markup idéntico (subir/bajar/
 * editar/eliminar) que vivía copiado entre `contenido/page.tsx` y
 * `educacion/page.tsx`.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import RowReorderActions from '@/components/admin/ui/RowReorderActions';

describe('RowReorderActions (T-30)', () => {
  it('deshabilita subir/bajar según disableUp/disableDown, y respeta busy en los cuatro botones', () => {
    const props = {
      disableUp: true,
      disableDown: false,
      busy: true,
      label: 'Servicio X',
      onUp: jest.fn(),
      onDown: jest.fn(),
      onEdit: jest.fn(),
      onDelete: jest.fn(),
    };
    render(<RowReorderActions {...props} />);

    expect(screen.getByRole('button', { name: 'Subir Servicio X' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Bajar Servicio X' })).toBeDisabled(); // disableDown=false pero busy=true

    fireEvent.click(screen.getByRole('button', { name: 'Editar Servicio X' }));
    expect(props.onEdit).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Servicio X' }));
    expect(props.onDelete).toHaveBeenCalled();
  });

  it('sin busy ni disable: subir y bajar llaman a sus callbacks', () => {
    const props = {
      disableUp: false,
      disableDown: false,
      busy: false,
      label: 'Hito Y',
      onUp: jest.fn(),
      onDown: jest.fn(),
      onEdit: jest.fn(),
      onDelete: jest.fn(),
    };
    render(<RowReorderActions {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Subir Hito Y' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bajar Hito Y' }));
    expect(props.onUp).toHaveBeenCalled();
    expect(props.onDown).toHaveBeenCalled();
  });
});

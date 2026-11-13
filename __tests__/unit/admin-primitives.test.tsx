/**
 * @jest-environment jsdom
 */

/**
 * Tests de comportamiento de los primitivos del panel.
 *
 * No comprueban clases de Tailwind (eso lo rompe cualquier refactor de estilo
 * sin que nada funcione peor). Comprueban lo que de verdad se rompe en
 * silencio: la asociación label↔control, el `aria-describedby` que cose pista
 * y error, el estado indeterminado del checkbox, el teclado de las pestañas,
 * que el tooltip también abra con el dedo, y que la DataTable pinte el mismo
 * dato en tarjetas (móvil) y en tabla (escritorio) desde una sola definición
 * de columnas.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Input } from '@/components/admin/ui/Input';
import { Textarea } from '@/components/admin/ui/Textarea';
import { Select } from '@/components/admin/ui/Select';
import { Checkbox } from '@/components/admin/ui/Checkbox';
import { Switch } from '@/components/admin/ui/Switch';
import { TabPanel, Tabs } from '@/components/admin/ui/Tabs';
import { Tooltip } from '@/components/admin/ui/Tooltip';
import { SkeletonRegion } from '@/components/admin/ui/Skeleton';
import { Dialog } from '@/components/admin/ui/Dialog';
import { DataTable, type Column } from '@/components/admin/ui/DataTable';

describe('Input', () => {
  it('asocia la etiqueta con el control', () => {
    render(<Input label="Título del proyecto" />);
    expect(screen.getByLabelText('Título del proyecto')).toBeInTheDocument();
  });

  it('cose la pista al control con aria-describedby', () => {
    render(<Input label="Demo" hint="URL que se embebe en el visor" />);
    const input = screen.getByLabelText('Demo');
    const hint = screen.getByText('URL que se embebe en el visor');
    expect(input).toHaveAttribute('aria-describedby', hint.id);
  });

  it('el error sustituye a la pista, se anuncia y marca el campo inválido', () => {
    render(
      <Input label="Demo" hint="Pista visible" error="La URL no es válida" />,
    );
    const input = screen.getByLabelText('Demo');

    expect(screen.queryByText('Pista visible')).not.toBeInTheDocument();
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('La URL no es válida');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
  });

  it('marca lo obligatorio también para lectores de pantalla', () => {
    render(<Input label="Título" required />);
    expect(screen.getByLabelText(/obligatorio/i)).toBeRequired();
  });

  it('acepta adornos sin chocar con los atributos HTML del input', () => {
    render(<Input label="Precio" startAdornment="$" endAdornment="COP" />);
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('COP')).toBeInTheDocument();
    // `prefix` es un atributo HTML real: el prop se llama startAdornment
    // justamente para no pisarlo.
    expect(screen.getByLabelText('Precio')).not.toHaveAttribute('prefix');
  });
});

describe('Textarea', () => {
  it('muestra el contador cuando se le da máximo', () => {
    render(
      <Textarea
        label="Descripción"
        maxLength={100}
        showCount
        value="hola"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('4/100')).toBeInTheDocument();
  });

  it('no muestra contador sin maxLength', () => {
    render(<Textarea label="Descripción" showCount value="hola" onChange={() => {}} />);
    expect(screen.queryByText(/\/\d+/)).not.toBeInTheDocument();
  });
});

describe('Select', () => {
  const options = [
    { value: 'web', label: 'Web' },
    { value: 'movil', label: 'Móvil' },
  ];

  it('renderiza las opciones y el placeholder deshabilitado', () => {
    render(
      <Select label="Categoría" options={options} placeholder="Elige una" defaultValue="" />,
    );
    const select = screen.getByLabelText('Categoría');
    expect(within(select).getAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('option', { name: 'Elige una' })).toBeDisabled();
  });

  it('es un select nativo (rueda del sistema en móvil)', () => {
    render(<Select label="Categoría" options={options} />);
    expect(screen.getByLabelText('Categoría').tagName).toBe('SELECT');
  });
});

describe('Checkbox', () => {
  it('se alterna pulsando la etiqueta, no solo el cuadrito', () => {
    const onChange = jest.fn();
    render(<Checkbox label="Publicado" onChange={onChange} />);
    fireEvent.click(screen.getByText('Publicado'));
    expect(onChange).toHaveBeenCalled();
  });

  it('aplica el estado mixto como propiedad del DOM', () => {
    render(<Checkbox label="Seleccionar todo" indeterminate checked={false} onChange={() => {}} />);
    const box = screen.getByLabelText('Seleccionar todo') as HTMLInputElement;
    // `indeterminate` no existe como atributo HTML, solo como propiedad.
    expect(box.indeterminate).toBe(true);
  });

  it('sigue siendo un input nativo (foco, barra espaciadora, formularios)', () => {
    render(<Checkbox label="Publicado" />);
    expect(screen.getByLabelText('Publicado')).toHaveAttribute('type', 'checkbox');
  });
});

describe('Switch', () => {
  it('expone el rol switch con su estado', () => {
    render(<Switch checked label="Notificaciones" onChange={() => {}} />);
    const sw = screen.getByRole('switch');
    expect(sw).toBeChecked();
  });

  it('avisa del cambio', () => {
    const onChange = jest.fn();
    render(<Switch checked={false} label="Notificaciones" onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe('Tabs', () => {
  const items = [
    { id: 'proyectos', label: 'Proyectos', count: 24 },
    { id: 'skills', label: 'Skills', count: 10 },
    { id: 'insignias', label: 'Insignias', count: 173 },
  ];

  function setup(active = 'proyectos') {
    const onChange = jest.fn();
    render(
      <Tabs items={items} activeId={active} onChange={onChange} ariaLabel="Secciones" />,
    );
    return { onChange };
  }

  it('marca la pestaña activa y saca al resto del orden de tabulación', () => {
    setup();
    const activa = screen.getByRole('tab', { selected: true });
    expect(activa).toHaveTextContent('Proyectos');
    expect(activa).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: /Skills/ })).toHaveAttribute('tabindex', '-1');
  });

  it('muestra los contadores reales', () => {
    setup();
    expect(screen.getByText('173')).toBeInTheDocument();
  });

  it('navega con las flechas y da la vuelta', () => {
    const { onChange } = setup('proyectos');
    const lista = screen.getByRole('tablist');

    fireEvent.keyDown(lista, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('skills');

    fireEvent.keyDown(lista, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('insignias'); // da la vuelta
  });

  it('Home y End van a los extremos', () => {
    const { onChange } = setup('skills');
    const lista = screen.getByRole('tablist');

    fireEvent.keyDown(lista, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('insignias');

    fireEvent.keyDown(lista, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith('proyectos');
  });

  it('salta las pestañas deshabilitadas', () => {
    const onChange = jest.fn();
    render(
      <Tabs
        items={[
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B', disabled: true },
          { id: 'c', label: 'C' },
        ]}
        activeId="a"
        onChange={onChange}
        ariaLabel="Secciones"
      />,
    );
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('TabPanel solo pinta el panel activo y queda enlazado a su pestaña', () => {
    render(
      <>
        <Tabs items={items} activeId="skills" onChange={() => {}} ariaLabel="Secciones" />
        <TabPanel tabId="proyectos" activeId="skills">
          contenido proyectos
        </TabPanel>
        <TabPanel tabId="skills" activeId="skills">
          contenido skills
        </TabPanel>
      </>,
    );
    expect(screen.queryByText('contenido proyectos')).not.toBeInTheDocument();
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveTextContent('contenido skills');
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-skills');
  });
});

describe('Tooltip', () => {
  it('abre al enfocar con teclado', () => {
    render(
      <Tooltip content="Commits de los últimos 30 días">
        <button type="button">info</button>
      </Tooltip>,
    );
    fireEvent.focus(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Commits de los últimos 30 días',
    );
  });

  it('abre y cierra al tocar: en táctil no hay hover', () => {
    render(
      <Tooltip content="dato de apoyo">
        <button type="button">info</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button');

    fireEvent.click(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('cierra con Escape', () => {
    render(
      <Tooltip content="dato de apoyo">
        <button type="button">info</button>
      </Tooltip>,
    );
    fireEvent.focus(screen.getByRole('button'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('conserva el onClick original del disparador', () => {
    const onClick = jest.fn();
    render(
      <Tooltip content="x">
        <button type="button" onClick={onClick}>
          info
        </button>
      </Tooltip>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('SkeletonRegion', () => {
  it('anuncia la carga y luego entrega el contenido', () => {
    const { rerender } = render(
      <SkeletonRegion loading label="métricas" skeleton={<span>hueco</span>}>
        <span>datos reales</span>
      </SkeletonRegion>,
    );
    expect(screen.getByText('Cargando métricas…')).toBeInTheDocument();
    expect(screen.queryByText('datos reales')).not.toBeInTheDocument();

    rerender(
      <SkeletonRegion loading={false} label="métricas" skeleton={<span>hueco</span>}>
        <span>datos reales</span>
      </SkeletonRegion>,
    );
    expect(screen.getByText('datos reales')).toBeInTheDocument();
    expect(screen.queryByText('hueco')).not.toBeInTheDocument();
  });
});

describe('Dialog', () => {
  it('no pinta nada cerrado', () => {
    render(<Dialog open={false} onClose={() => {}} title="Editar proyecto" />);
    expect(screen.queryByText('Editar proyecto')).not.toBeInTheDocument();
  });

  it('abierto expone título, descripción y cierre accesible', () => {
    const onClose = jest.fn();
    render(
      <Dialog
        open
        onClose={onClose}
        title="Editar proyecto"
        description="Los cambios se reflejan en la home"
      >
        <p>cuerpo</p>
      </Dialog>,
    );
    expect(screen.getByText('Editar proyecto')).toBeInTheDocument();
    expect(screen.getByText('Los cambios se reflejan en la home')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('DataTable', () => {
  type Repo = { name: string; commits: number; lang: string; stars: number };

  const rows: Repo[] = [
    { name: 'mi-portafolio-moderno', commits: 412, lang: 'TypeScript', stars: 0 },
    { name: 'Jarvis', commits: 88, lang: 'Python', stars: 2 },
  ];

  const columns: Column<Repo>[] = [
    { id: 'name', header: 'Repositorio', cell: (r) => r.name, mobile: 'primary' },
    { id: 'lang', header: 'Lenguaje', cell: (r) => r.lang, mobile: 'meta' },
    { id: 'commits', header: 'Commits', cell: (r) => r.commits, align: 'right' },
    { id: 'stars', header: 'Stars', cell: (r) => r.stars, align: 'right' },
  ];

  it('pinta el mismo dato en tarjetas y en tabla desde una sola definición', () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.name}
        caption="Repositorios"
      />,
    );

    // Lista de tarjetas (móvil) y tabla (escritorio) coexisten en el DOM; es
    // el breakpoint el que decide cuál se ve. Ambas salen de `columns`.
    expect(screen.getByRole('list', { name: 'Repositorios' })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();

    // Cada repo aparece dos veces: una por marcado.
    expect(screen.getAllByText('mi-portafolio-moderno')).toHaveLength(2);
    expect(screen.getAllByText('412')).toHaveLength(2);
  });

  it('en la tarjeta, las columnas sin rol salen como pares etiqueta/valor', () => {
    render(
      <DataTable
        columns={columns}
        rows={[rows[0]]}
        rowKey={(r) => r.name}
        caption="Repositorios"
      />,
    );
    const tarjeta = screen.getByRole('listitem');
    // `commits` y `stars` no declaran `mobile`, así que van con su etiqueta.
    expect(within(tarjeta).getByText('Commits')).toBeInTheDocument();
    expect(within(tarjeta).getByText('Stars')).toBeInTheDocument();
    // La primaria es el título, no un par: su header no se repite dentro.
    expect(within(tarjeta).queryByText('Repositorio')).not.toBeInTheDocument();
  });

  it('la tabla lleva encabezados con scope y caption para lectores', () => {
    render(
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.name} caption="Repositorios" />,
    );
    const tabla = screen.getByRole('table');
    expect(within(tabla).getAllByRole('columnheader')).toHaveLength(4);
    expect(within(tabla).getByText('Repositorios')).toBeInTheDocument(); // caption sr-only
  });

  it('respeta el estado vacío', () => {
    render(
      <DataTable
        columns={columns}
        rows={[]}
        rowKey={(r) => r.name}
        caption="Repositorios"
        empty={<p>Sin repositorios todavía</p>}
      />,
    );
    expect(screen.getByText('Sin repositorios todavía')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('en carga anuncia el estado y no pinta filas', () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.name}
        caption="Repositorios"
        loading
      />,
    );
    expect(screen.getByText('Cargando datos…')).toBeInTheDocument();
    expect(screen.queryByText('mi-portafolio-moderno')).not.toBeInTheDocument();
  });

  it('hace la fila pulsable cuando hay onRowClick', () => {
    const onRowClick = jest.fn();
    render(
      <DataTable
        columns={columns}
        rows={[rows[0]]}
        rowKey={(r) => r.name}
        caption="Repositorios"
        onRowClick={onRowClick}
      />,
    );
    // En móvil la tarjeta entera es un botón: objetivo táctil grande.
    fireEvent.click(screen.getByRole('button'));
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it('coloca las acciones en tarjeta y en tabla', () => {
    render(
      <DataTable
        columns={columns}
        rows={[rows[0]]}
        rowKey={(r) => r.name}
        caption="Repositorios"
        actions={(r) => <button type="button">Editar {r.name}</button>}
      />,
    );
    expect(screen.getAllByRole('button', { name: /Editar/ })).toHaveLength(2);
    expect(screen.getByText('Acciones')).toBeInTheDocument(); // encabezado sr-only
  });
});

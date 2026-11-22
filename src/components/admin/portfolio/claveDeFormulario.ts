/**
 * Clave de remonte para los nueve `*FormDialog` de portfolio.
 *
 * ## Qué problema resuelve
 *
 * Los nueve diálogos tenían la misma pareja: un `useState` con inicializador
 * perezoso que calcula los valores a partir de `initial`, y un `useEffect`
 * que repetía ESA MISMA expresión para reinicializar el formulario cada vez
 * que se abría:
 *
 *     const [values, setValues] = useState(() => initial ? desdeInicial(initial) : vacio());
 *     useEffect(() => {
 *       if (open) { setValues(initial ? desdeInicial(initial) : vacio()); ... }
 *     }, [open, initial]);
 *
 * Sincronizar props → estado en un efecto tiene un defecto propio: React
 * pinta UNA VEZ con los valores viejos y solo después corre el efecto y vuelve
 * a pintar. Al abrir para editar la fila B justo después de haber editado la
 * A, hay un fotograma con los datos de A dentro del formulario de B.
 *
 * La respuesta de React a «quiero estado fresco cuando cambia la entrada» no
 * es sincronizar, es REMONTAR: se le da una `key` distinta al componente y su
 * estado nace de cero, con el inicializador perezoso que ya existía haciendo
 * exactamente el trabajo que duplicaba el efecto. Un solo render, sin
 * fotograma intermedio, y una fuente de verdad en vez de dos copias de la
 * misma expresión que podían divergir.
 *
 * ## Por qué remontar aquí no cuesta nada
 *
 * El `Dialog` del panel pasa `open` a `Dialog` de Headless UI SIN envolverlo
 * en `Transition`, así que con `open=false` no renderiza nada: no hay
 * animación de salida que un desmontaje pudiera interrumpir.
 *
 * ## Qué entra en la clave
 *
 * `open`, para que CADA apertura sea un montaje nuevo (al cerrar, la clave
 * pasa a `'cerrado'`, y eso es lo que descarta lo que el usuario dejó
 * escrito), y la identidad de la fila editada, para que cambiar de fila sin
 * cerrar también remonte. La identidad es el campo natural de cada tabla
 * (`slug`, o `name` en tecnologías); `InterestFormDialog` no recibe ninguno
 * porque sus elementos se identifican por su índice dentro del array del
 * perfil, que el diálogo no conoce — ahí `open` basta, porque la página
 * siempre pone `initial` y `open` en el mismo gesto.
 *
 * ## Una diferencia de comportamiento, a mejor
 *
 * Con el efecto, CUALQUIER `initial` nuevo por identidad de objeto reiniciaba
 * el formulario, así que un refresco de datos de fondo mientras el usuario
 * escribía le borraba lo escrito. Con la clave, solo remonta si cambia la
 * fila de verdad: lo que estaba escribiendo sobrevive.
 */
export function claveDeFormulario(
  open: boolean,
  identidad?: string | null,
): string {
  if (!open) return 'cerrado';
  return `abierto:${identidad ?? 'nuevo'}`;
}

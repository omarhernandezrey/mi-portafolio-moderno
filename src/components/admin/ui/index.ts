/**
 * Primitivos del panel. Punto de entrada único.
 *
 * Importa siempre desde aquí (`@/components/admin/ui`) y no del archivo
 * concreto: así se puede reorganizar el interior sin tocar las vistas.
 *
 * Para botones del panel, `AdminButton`. (El viejo
 * `src/components/ui/Button.tsx`, que hardcodeaba `bg-blue-500` fuera del
 * sistema, se eliminó en T-24: no lo importaba nadie.)
 */

// Pre-existentes
export { default as AdminCard } from './AdminCard';
export { AdminButton, AdminButtonLink, adminButtonClasses } from './AdminButton';
export { default as EmptyState } from './EmptyState';
export { default as ErrorState } from './ErrorState';
export { default as PageHeader } from './PageHeader';

// Formulario
export { Field, controlClasses, useFieldIds } from './Field';
export type { FieldIds, FieldProps } from './Field';
export { Input } from './Input';
export type { InputProps } from './Input';
export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';
export { Select } from './Select';
export type { SelectOption, SelectProps } from './Select';
export { Checkbox } from './Checkbox';
export type { CheckboxProps } from './Checkbox';
export { Switch } from './Switch';
export type { SwitchProps } from './Switch';

// Estructura y estado
export { Tabs, TabPanel } from './Tabs';
export type { TabItem, TabsProps, TabPanelProps } from './Tabs';
export { Tooltip } from './Tooltip';
export type { TooltipProps } from './Tooltip';
export {
  Skeleton,
  SkeletonText,
  SkeletonStatCard,
  SkeletonRegion,
} from './Skeleton';
export type { SkeletonProps, SkeletonTextProps, SkeletonRegionProps } from './Skeleton';
export { Dialog, ConfirmDialog } from './Dialog';
export type { DialogProps, ConfirmDialogProps } from './Dialog';
export { DataTable } from './DataTable';
export type { Column, DataTableProps } from './DataTable';

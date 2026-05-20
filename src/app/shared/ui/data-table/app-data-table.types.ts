import { LucideIconData } from 'lucide-angular';
import { AppTagStatus } from '../tag/app-tag.types';

export interface AppTableColumn<T extends object = Record<string, unknown>> {
  id?: string;
  field: Extract<keyof T, string>;
  header: string;
  type?: 'text' | 'status';
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  value?: (item: T) => unknown;
  status?: (item: T) => AppTagStatus;

  sortValue?: (item: T) => AppTableSortValue;
}

export interface AppTableRowAction<T extends object = Record<string, unknown>> {
  id: string;
  label: string;
  title?: string;
  tooltip?: string;
  ariaLabel?: string;
  icon?: LucideIconData;
  tone?: 'default' | 'danger';
  visible?: (item: T) => boolean;
  disabled?: (item: T) => boolean;
}

export interface AppTableRowActionEvent<T extends object = Record<string, unknown>> {
  actionId: string;
  action: AppTableRowAction<T>;
  item: T;
}

export interface AppTableCellContext<T extends object = Record<string, unknown>> {
  $implicit: T;
  item: T;
  column: AppTableColumn<T>;
  value: unknown;
}

export type AppTableSortOrder = 'asc' | 'desc';
export type AppTableSortValue = string | number | Date | null | undefined;

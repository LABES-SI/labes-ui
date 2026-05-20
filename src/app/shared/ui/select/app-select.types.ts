export interface AppSelectOption<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
}

export type AppSelectSize = 'sm' | 'md' | 'lg';
export type AppSelectStatus = 'default' | 'invalid';

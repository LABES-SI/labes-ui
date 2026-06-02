import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { AppSelectOption, AppSelectSize, AppSelectStatus } from './app-select.types';

type PrimeSelectSize = 'small' | 'large';

let nextSelectId = 0;

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [FormsModule, SelectModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppSelectComponent),
      multi: true,
    },
  ],
  template: `
    <label class="app-field" [for]="selectId()">
      @if (label()) {
        <span class="app-field__label">{{ label() }}</span>
      }

      <p-select
        [inputId]="selectId()"
        [options]="primeOptions()"
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [invalid]="isInvalid()"
        [size]="primeSize()"
        [loading]="loading()"
        [showClear]="showClear()"
        [fluid]="true"
        appendTo="body"
        [ngModel]="value()"
        (ngModelChange)="onValueChange($event)"
        (onBlur)="onTouched()"
      />

      @if (error()) {
        <span class="app-field__error">{{ error() }}</span>
      } @else if (hint()) {
        <span class="app-field__hint">{{ hint() }}</span>
      }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSelectComponent implements ControlValueAccessor {
  readonly id = input<string | null>(null);
  readonly label = input('');
  readonly placeholder = input('');
  readonly options = input<readonly AppSelectOption[]>([]);
  readonly size = input<AppSelectSize>('md');
  readonly status = input<AppSelectStatus>('default');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly showClear = input(false);
  readonly hint = input('');
  readonly error = input('');

  readonly value = signal<unknown>(null);
  private readonly generatedId = `app-select-${++nextSelectId}`;
  private readonly disabledByControl = signal(false);

  readonly selectId = computed(() => this.id() ?? this.generatedId);
  readonly primeOptions = computed(() => [...this.options()]);
  readonly isDisabled = computed(() => this.disabled() || this.disabledByControl());
  readonly isInvalid = computed(() => this.status() === 'invalid' || Boolean(this.error()));
  readonly primeSize = computed<PrimeSelectSize | undefined>(() => {
    const size = this.size();
    return size === 'md' ? undefined : size === 'sm' ? 'small' : 'large';
  });

  private onChange: (value: unknown) => void = () => undefined;
  onTouched: () => void = () => undefined;

  writeValue(value: unknown): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByControl.set(isDisabled);
  }

  onValueChange(value: unknown): void {
    this.value.set(value);
    this.onChange(value);
  }
}

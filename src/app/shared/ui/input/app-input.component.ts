import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { AppInputSize, AppInputStatus, AppInputType } from './app-input.types';

type PrimeInputSize = 'small' | 'large';
type AppInputMask = 'cpf' | 'pae' | 'telefone';

let nextInputId = 0;

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [InputTextModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppInputComponent),
      multi: true,
    },
  ],
  template: `
    <label class="app-field" [for]="resolvedInputId()">
      @if (label()) {
        <span class="app-field__label">{{ label() }}</span>
      }

      <input
        pInputText
        [id]="resolvedInputId()"
        [type]="type()"
        [value]="currentValue() ?? ''"
        [placeholder]="placeholder()"
        [attr.maxlength]="maxLength() ?? null"
        [disabled]="isDisabled()"
        [readOnly]="readOnly()"
        [autocomplete]="autocomplete()"
        [invalid]="isInvalid()"
        [pSize]="primeSize()"
        [fluid]="true"
        [attr.inputmode]="inputMode() || null"
        [attr.aria-invalid]="isInvalid()"
        [attr.aria-describedby]="describedBy()"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />

      @if (error()) {
        <span class="app-field__error" [id]="errorId()">{{ error() }}</span>
      } @else if (hint()) {
        <span class="app-field__hint" [id]="hintId()">{{ hint() }}</span>
      }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppInputComponent implements ControlValueAccessor {
  readonly inputId = input<string | null>(null);
  readonly label = input('');
  readonly placeholder = input('');
  readonly type = input<AppInputType>('text');
  readonly size = input<AppInputSize>('md');
  readonly status = input<AppInputStatus>('default');
  readonly disabled = input(false);
  readonly readOnly = input(false);
  readonly autocomplete = input('');
  readonly inputMode = input<string | null>(null);
  readonly mask = input<AppInputMask | null>(null);
  readonly maxLength = input<number | null>(null);
  readonly hint = input('');
  readonly error = input('');

  readonly currentValue = signal<string | null>(null);

  private readonly generatedId = `app-input-${++nextInputId}`;
  private readonly disabledByControl = signal(false);

  readonly resolvedInputId = computed(() => this.inputId() ?? this.generatedId);

  readonly isDisabled = computed(() => {
    return this.disabled() || this.disabledByControl();
  });

  readonly isInvalid = computed(() => {
    return this.status() === 'invalid' || Boolean(this.error());
  });

  readonly primeSize = computed<PrimeInputSize | undefined>(() => {
    const size = this.size();
    return size === 'md' ? undefined : size === 'sm' ? 'small' : 'large';
  });
  readonly hintId = computed(() => `${this.resolvedInputId()}-hint`);
  readonly errorId = computed(() => `${this.resolvedInputId()}-error`);

  readonly describedBy = computed(() => {
    if (this.error()) return this.errorId();
    if (this.hint()) return this.hintId();
    return null;
  });

  private onChange: (value: string | null) => void = () => undefined;
  onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.currentValue.set(this.formatMaskedValue(value));
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByControl.set(isDisabled);
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;
    const value = this.formatMaskedValue(rawValue);

    input.value = value ?? '';

    this.currentValue.set(value);
    this.onChange(value);
  }

  private formatMaskedValue(value: string | null): string | null {
    const rawValue = value ?? '';

    if (!rawValue) {
      return null;
    }

    switch (this.mask()) {
      case 'pae':
        return this.formatarNumeroPae(rawValue);
      case 'telefone':
        return this.formatarTelefone(rawValue);
      case 'cpf':
        return this.formatarCpf(rawValue);
      default:
        return rawValue;
    }
  }

  private formatarCpf(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 3) {
      return digits;
    }

    if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }

    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  private formatarNumeroPae(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    const ano = digits.slice(0, 4);
    const numero = digits.slice(4, 14);

    if (!ano) {
      return '';
    }

    if (!numero) {
      return ano;
    }

    return `${ano}/${numero}`;
  }

  private formatarTelefone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 2) {
      return digits.length ? `(${digits}` : '';
    }

    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
}

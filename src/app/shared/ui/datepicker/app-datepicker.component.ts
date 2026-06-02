import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import {
  AppDatepickerSize,
  AppDatepickerStatus,
  AppDatepickerValue,
  AppDatepickerValueMode,
} from './app-datepicker.types';

type PrimeDatepickerSize = 'small' | 'large';

let nextDatepickerId = 0;

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [FormsModule, DatePickerModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppDatepickerComponent),
      multi: true,
    },
  ],
  template: `
    <label class="app-field" [for]="resolvedInputId()">
      @if (label()) {
        <span class="app-field__label">{{ label() }}</span>
      }

      <p-datepicker
        [inputId]="resolvedInputId()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [readonlyInput]="readonly()"
        [minDate]="minDate()"
        [maxDate]="maxDate()"
        [showIcon]="showIcon()"
        [showTime]="showTime()"
        [timeOnly]="timeOnly()"
        [hourFormat]="hourFormat()"
        [stepMinute]="stepMinute() ?? undefined"
        [dateFormat]="dateFormat()"
        [size]="primeSize()"
        [invalid]="isInvalid()"
        [fluid]="true"
        [dataType]="primeDataType()"
        appendTo="body"
        [autoZIndex]="true"
        [baseZIndex]="1300"
        [ngModel]="currentValue()"
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
export class AppDatepickerComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly placeholder = input('');
  readonly value = input<AppDatepickerValue>(null);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly minDate = input<Date | undefined>(undefined);
  readonly maxDate = input<Date | undefined>(undefined);
  readonly showIcon = input(true);
  readonly showTime = input(false);
  readonly timeOnly = input(false);
  readonly hourFormat = input<'12' | '24'>('24');
  readonly stepMinute = input<number | null>(null);
  readonly dateFormat = input('dd/mm/yy');
  readonly valueMode = input<AppDatepickerValueMode>('date');
  readonly inputId = input<string | null>(null);
  readonly size = input<AppDatepickerSize>('md');
  readonly status = input<AppDatepickerStatus>('default');
  readonly hint = input('');
  readonly error = input('');
  readonly valueChange = output<AppDatepickerValue>();

  readonly currentValue = signal<AppDatepickerValue>(null);
  private readonly generatedId = `app-datepicker-${++nextDatepickerId}`;
  private readonly disabledByControl = signal(false);

  readonly resolvedInputId = computed(() => this.inputId() ?? this.generatedId);
  readonly isDisabled = computed(() => this.disabled() || this.disabledByControl());
  readonly isInvalid = computed(() => this.status() === 'invalid' || Boolean(this.error()));
  readonly primeDataType = computed(() => this.valueMode());
  readonly primeSize = computed<PrimeDatepickerSize | undefined>(() => {
    const size = this.size();
    return size === 'md' ? undefined : size === 'sm' ? 'small' : 'large';
  });

  private onChange: (value: AppDatepickerValue) => void = () => undefined;
  onTouched: () => void = () => undefined;

  constructor() {
    effect(() => {
      this.syncCurrentValue(this.value());
    });
  }

  writeValue(value: AppDatepickerValue): void {
    this.syncCurrentValue(value);
  }

  registerOnChange(fn: (value: AppDatepickerValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByControl.set(isDisabled);
  }

  onValueChange(value: AppDatepickerValue): void {
    if (this.areValuesEqual(this.currentValue(), value)) {
      return;
    }

    this.currentValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
  }

  private syncCurrentValue(value: AppDatepickerValue): void {
    if (this.areValuesEqual(this.currentValue(), value)) {
      return;
    }

    this.currentValue.set(this.normalizeValue(value));
  }

  private areValuesEqual(left: AppDatepickerValue, right: AppDatepickerValue): boolean {
    if (left == null || right == null) {
      return left == null && right == null;
    }

    if (left instanceof Date && right instanceof Date) {
      return left.getTime() === right.getTime();
    }

    if (left === right) {
      return true;
    }

    return String(left) === String(right);
  }

  private normalizeValue(value: AppDatepickerValue): AppDatepickerValue {
    if (value instanceof Date) {
      return new Date(value.getTime());
    }

    return value;
  }
}

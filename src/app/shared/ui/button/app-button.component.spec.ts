import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppButtonComponent } from './app-button.component';

@Component({
  standalone: true,
  imports: [AppButtonComponent],
  template: `
    <app-button
      label="Salvar"
      variant="primary"
      size="sm"
      [loading]="loading"
      [disabled]="disabled"
      (clicked)="onClicked()"
    />
  `,
})
class HostComponent {
  loading = false;
  disabled = false;
  onClicked = vi.fn();
}

describe('AppButtonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
  });

  it('expõe uma API própria e emite clicked quando habilitado', async () => {
    const fixture = await createHost();

    const button = fixture.debugElement.query(By.directive(AppButtonComponent));
    button.componentInstance.onClicked(new MouseEvent('click'));

    expect(fixture.componentInstance.onClicked).toHaveBeenCalledTimes(1);
  });

  it('não emite clicked quando está disabled ou loading', async () => {
    const disabledFixture = await createHost({ disabled: true });
    const disabledComponent = disabledFixture.debugElement.query(By.directive(AppButtonComponent))
      .componentInstance as AppButtonComponent;

    disabledComponent.onClicked(new MouseEvent('click'));
    expect(disabledFixture.componentInstance.onClicked).not.toHaveBeenCalled();

    const loadingFixture = await createHost({ loading: true });
    const loadingComponent = loadingFixture.debugElement.query(By.directive(AppButtonComponent))
      .componentInstance as AppButtonComponent;

    loadingComponent.onClicked(new MouseEvent('click'));
    expect(loadingFixture.componentInstance.onClicked).not.toHaveBeenCalled();
  });
});

async function createHost(
  initialState: Partial<HostComponent> = {},
): Promise<ComponentFixture<HostComponent>> {
  const fixture = TestBed.createComponent(HostComponent);
  Object.assign(fixture.componentInstance, initialState);
  fixture.detectChanges();
  return fixture;
}

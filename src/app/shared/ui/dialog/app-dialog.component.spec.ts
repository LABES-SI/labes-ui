import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it, vi } from 'vitest';
import { AppDialogComponent } from './app-dialog.component';

@Component({
  standalone: true,
  imports: [AppDialogComponent],
  template: `
    <app-dialog
      title="Confirmação"
      [visible]="visible"
      (visibleChange)="visible = $event"
      (closed)="onClosed()"
    >
      Conteúdo
    </app-dialog>
  `,
})
class HostComponent {
  visible = true;
  onClosed = vi.fn();
}

describe('AppDialogComponent', () => {
  it('emite visibleChange e closed usando eventos próprios', async () => {
    const fixture = await createHost();
    const dialog = fixture.debugElement.query(By.directive(AppDialogComponent))
      .componentInstance as AppDialogComponent;

    dialog.onHide();

    expect(fixture.componentInstance.visible).toBe(false);
    expect(fixture.componentInstance.onClosed).toHaveBeenCalledTimes(1);
  });
});

async function createHost(): Promise<ComponentFixture<HostComponent>> {
  await TestBed.configureTestingModule({
    imports: [HostComponent],
  }).compileComponents();

  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
}

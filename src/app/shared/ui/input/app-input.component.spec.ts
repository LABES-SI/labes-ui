import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AppInputComponent } from './app-input.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, AppInputComponent],
  template: ` <app-input label="Nome" placeholder="Digite o nome" [formControl]="control" /> `,
})
class HostComponent {
  control = new FormControl('Maria');
}

describe('AppInputComponent', () => {
  it('integra com Reactive Forms usando a API do Design System', async () => {
    const fixture = await createHost();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.value).toBe('Maria');

    input.value = 'Joao';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('Joao');
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

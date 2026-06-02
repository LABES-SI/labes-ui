import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AppDataTableComponent } from './app-data-table.component';
import { AppTableColumn } from './app-data-table.types';

interface UserRow {
  nome: string;
  status: string;
}

@Component({
  standalone: true,
  imports: [AppDataTableComponent],
  template: `<app-data-table [items]="items" [columns]="columns" />`,
})
class HostComponent {
  items: UserRow[] = [{ nome: 'Maria', status: 'Ativo' }];
  columns: AppTableColumn<UserRow>[] = [
    { field: 'nome', header: 'Nome' },
    { field: 'status', header: 'Status' },
  ];
}

describe('AppDataTableComponent', () => {
  it('renderiza linhas e colunas usando contratos próprios', async () => {
    const fixture = await createHost();

    expect(fixture.nativeElement.textContent).toContain('Nome');
    expect(fixture.nativeElement.textContent).toContain('Maria');
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

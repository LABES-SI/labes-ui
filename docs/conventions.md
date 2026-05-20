# Convencoes de Frontend - SIE

Este documento define o padrao de organizacao do frontend do SIE - Sintese de Indicadores Educacionais.

## Principios

- Angular moderno com standalone components.
- Rotas por feature usando Angular Router.
- SCSS separado por componente.
- `ChangeDetectionStrategy.OnPush` em componentes novos.
- `input()` e `output()` em componentes novos.
- `signal()` para estado local mutavel e `computed()` para estado derivado.
- Arquitetura feature-based.
- Pastas tecnicas em ingles.
- Features, arquivos, classes e dominio em portugues.
- Usar `facades/` para ponte com dados.
- Nao criar `data-access/`.

## Estrutura Atual

```text
src/app/
  core/
    layout/
      header/
      footer/
    services/

  shared/
    components/
      indicador-card/
      grafico-card/
      painel-filtros/
      tabela-dados/
      titulo-secao/

  features/
    inicio/
      pages/
        inicio-page/
      components/
      facades/
      models/
      mappers/
      inicio.routes.ts

    sobre/
      pages/
        sobre-page/
      components/
      facades/
      models/
      mappers/
      sobre.routes.ts

  app.routes.ts
  app.component.ts
```

## Responsabilidades

### `core/`

Contem elementos globais da aplicacao.

Pode conter:

- layout global, como header e footer;
- services globais;
- interceptors;
- guards globais;
- configuracoes transversais.

Nao deve conter regra especifica de uma feature.

### `shared/`

Contem componentes e utilitarios reutilizaveis e genericos.

Regras:

- nao acessar API;
- nao importar DTO de API;
- nao importar mapper de feature;
- receber dados via `input()`;
- emitir eventos via `output()`;
- nao conhecer detalhes de rota ou dominio especifico.

### `features/`

Contem as areas funcionais da aplicacao.

Cada feature deve seguir esta base:

```text
features/<nome-feature>/
  pages/
  components/
  facades/
  models/
  mappers/
  <nome-feature>.routes.ts
```

Use `services/` apenas quando houver necessidade real de orquestracao ou regra de negocio interna.

## Pages

Pages sao a entrada de cada rota.

Devem:

- compor a tela;
- chamar facades;
- controlar loading e erro;
- passar dados para componentes filhos;
- receber eventos de componentes filhos.

Nao devem:

- acessar `HttpClient` diretamente;
- criar mocks diretamente;
- importar DTO de API;
- importar mapper;
- concentrar regra de negocio complexa.

## Components

Components devem ser preferencialmente apresentacionais.

Devem:

- usar `standalone: true`;
- usar `ChangeDetectionStrategy.OnPush`;
- receber dados por `input()`;
- emitir eventos por `output()`;
- manter apenas estado local simples.

Nao devem:

- acessar API;
- importar facade quando forem componentes apresentacionais;
- conhecer regra de negocio complexa;
- conhecer detalhes de rota.

## Facades

Facades sao a ponte entre a feature e os dados.

Devem:

- expor metodos que a page consome;
- retornar dados mockados enquanto nao houver API;
- chamar services ou clients de API quando existirem;
- aplicar mappers quando houver transformacao;
- entregar dados prontos para a tela.

Pages e components nao devem acessar API diretamente.

## Mappers

Mappers devem ser funcoes puras.

Devem:

- converter DTO de API em model interno;
- converter mock bruto em model interno;
- converter model interno em view model, quando necessario.

Nao devem:

- usar `inject()`;
- acessar services;
- acessar Router;
- manipular DOM;
- ser importados por pages ou components.

## Models

Models de dominio ficam dentro da propria feature.

Use `core/models` apenas para contratos realmente globais e estaveis, como paginacao, resposta padrao de API ou erro padrao.

Nao centralize todos os models no `core`.

## Rotas

Cada feature roteavel deve ter seu arquivo `<feature>.routes.ts`.

Exemplo:

```ts
import { Routes } from '@angular/router';

export const inicioRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/inicio-page/inicio-page.component').then((m) => m.InicioPageComponent),
  },
];
```

No `app.routes.ts`, carregue a feature por lazy loading:

```ts
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'inicio',
  },
  {
    path: 'inicio',
    loadChildren: () => import('./features/inicio/inicio.routes').then((m) => m.inicioRoutes),
  },
];
```

## Como Criar Uma Nova Feature

1. Criar a pasta em `src/app/features/<nome-feature>`.
2. Criar `pages/`, `components/`, `facades/`, `models/` e `mappers/`.
3. Criar `<nome-feature>.routes.ts`.
4. Criar a page principal em `pages/<nome-feature>-page/`.
5. Criar uma facade para a feature.
6. Registrar a rota no `app.routes.ts`.
7. Usar componentes compartilhados de `shared/components` quando fizer sentido.
8. Criar componentes especificos dentro da propria feature quando nao forem reutilizaveis.

## Checklist Antes De Concluir Uma Tarefa

- A rota funciona.
- A page chama facade, nao API diretamente.
- Componentes recebem dados por `input()`.
- Eventos saem por `output()`.
- Estado derivado usa `computed()`.
- Mocks estao na facade ou em mocks consumidos pela facade.
- Nao existe duplicidade de pasta com o mesmo papel, como `layout` e `layouts`.
- `npm run validate` passa localmente.

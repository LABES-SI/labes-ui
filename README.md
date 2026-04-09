# LABES UI Frontend

Projeto frontend em Angular 21 com componentes standalone, OnPush e arquitetura feature-based.

## Stack

- Angular 21.2.x
- Angular CLI 21.2.x
- TypeScript 5.9.x
- RxJS 7.8.x
- Testes com ng test (builder de unit test do Angular)

## Pré-requisitos

- Node.js 22
- npm 10+

Opcional: usar NVM para controlar versão do Node.

## Setup do projeto

1. Clonar o repositório:

```bash
git clone https://github.com/LABES-SI/labes-ui.git
cd labes-ui
```

2. Instalar dependências:

```bash
npm install
```

3. Rodar ambiente local:

```bash
npm start
```

Aplicação em http://localhost:4200/.

## Scripts disponíveis

```bash
npm start
```

Sobe o servidor de desenvolvimento.

```bash
npm run build
```

Gera build de produção em dist/.

```bash
npm run watch
```

Build contínua em modo desenvolvimento.

```bash
npm test
```

Executa os testes unitários.

```bash
npm run lint
```

Executa ESLint no projeto.

```bash
npm run lint:fix
```

Executa ESLint com correções automáticas.

```bash
npm run format:check
```

Valida formatação com Prettier.

```bash
npm run format
```

Aplica formatação com Prettier.

```bash
npm run test:ci
```

Executa testes em modo CI (sem watch).

## Padronização de código (ESLint e Prettier)

O projeto mantém ESLint e Prettier como padrão de qualidade e formatação.

Comandos úteis:

```bash
npm run lint
```

```bash
npm run format:check
```

```bash
npm run format
```

Recomendação: validar lint e formatação antes de abrir PR.

## Qualidade no fluxo

Husky executa verificações automaticamente em hooks do Git para impedir que código inválido avance no fluxo.

Hooks locais com Husky:

- pre-commit: `npm run lint` + `npm run format:check`
- pre-push: `npm run test:ci` + `npm run build`

CI (GitHub Actions):

- Workflow: `.github/workflows/ci.yml`
- Execução em push para main e pull requests
- Etapas: install (npm ci), lint, test:ci e build

### Fluxo antes de abrir PR

1. Atualizar a branch com a main.
2. Executar validação local completa:

```bash
npm run lint
npm run format:check
npm run test:ci
npm run build
```

3. Se `format:check` falhar, rodar `npm run format` e repetir a validação.
4. Fazer commit (o Husky valida no pre-commit).
5. Fazer push (o Husky valida no pre-push) e abrir o PR.

## Arquitetura feature-based

Esta base foi estruturada por camadas e por domínio de negócio.

### Estrutura atual do app

```text
src/app
├─ app.component.ts
├─ app.component.html
├─ app.component.css
├─ app.config.ts
├─ app.routes.ts
├─ app.spec.ts
├─ core/
│  └─ layouts/
│     └─ app-shell/
│        ├─ app-shell.component.ts
│        ├─ app-shell.component.html
│        └─ app-shell.component.css
│  └─ services/
│     └─ api.service.ts
├─ shared/
│  └─ ui/
│     └─ feature-card/
│        ├─ feature-card.component.ts
│        ├─ feature-card.component.html
│        └─ feature-card.component.css
└─ features/
   └─ home/
      ├─ home.routes.ts
      └─ pages/
         └─ home-page/
            ├─ home-page.component.ts
            ├─ home-page.component.html
            └─ home-page.component.css
```

### Responsabilidade por camada

- core: layout e elementos de aplicação global.
- shared: componentes e utilitários reutilizáveis, sem regra de domínio.
- features: regras de domínio isoladas por feature, com rotas próprias.

### Fluxo de roteamento atual

1. app.component renderiza apenas router-outlet.
2. app.routes carrega o AppShellComponent.
3. Dentro do shell, as features entram por lazy loading.
4. A feature home possui arquivo de rotas próprio (home.routes.ts).

### Estrutura padrão para nova feature

```text
src/app/features/<nome-feature>/
├─ <nome-feature>.routes.ts
├─ pages/
├─ components/
├─ services/
└─ models/
```

Regras práticas:

- não acoplar uma feature na outra por import direto;
- extrair para shared apenas o que for realmente reutilizável;
- manter core sem regra de negócio.

### Padrão de models

Regra de organização dos models:

- models de domínio ficam dentro da própria feature (src/app/features/<feature>/models);
- models globais e transversais ficam no core (src/app/core/models).

Quando usar core/models:

- contratos compartilhados entre várias features;
- envelopes de API (ex.: paginação, resposta padrão, erro padrão);
- tipos globais de autenticação/sessão.

Quando usar models da feature:

- entidades e DTOs específicos de uma única feature;
- tipos que representam regras do domínio daquela área;
- contratos que não são reutilizados por outros módulos.

Importante:

- não centralizar todos os models no core;
- promover um model de feature para core apenas quando ele virar compartilhado e estável.

Exemplos:

- core/models: ApiResponse<T>, PaginatedResult<T>, ErrorResponse
- features/users/models: User, UserDetailsDto

### Padrão de consumo de API

Regra obrigatória do projeto:

- todo service que consumir API deve estender o ApiService do core.

Arquivo base:

- src/app/core/services/api.service.ts

Esse service centraliza os métodos HTTP básicos (get, post, put, patch, delete) e usa a URL base da API via environment.

Ambientes:

- src/environments/environment.ts (desenvolvimento)
- src/environments/environment.prod.ts (produção)

Exemplo de service de feature:

```ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';

export interface UserDto {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService extends ApiService {
  list(): Observable<UserDto[]> {
    return this.get<UserDto[]>('users');
  }

  update(id: number, payload: Partial<UserDto>): Observable<UserDto> {
    return this.patch<UserDto>(`users/${id}`, payload);
  }
}
```

## Docker

O projeto inclui Dockerfile simples para desenvolvimento.

1. Build da imagem:

```bash
docker build -t labes-ui:latest .
```

2. Rodar container:

```bash
docker run --rm -p 4200:4200 labes-ui:latest
```

Aplicação em http://localhost:4200/.

## Estratégia de branches

Para este projeto, o padrão é Trunk-Based Development com branches curtas.

Branches do fluxo:

- main: branch principal, protegida e estável;
- feature/<ticket>-<descricao>: novas funcionalidades;
- fix/<ticket>-<descricao>: correções não urgentes;
- hotfix/<ticket>-<descricao>: correções urgentes de produção.

Exemplos de nomes:

- feature/LAB-123-login-social
- fix/LAB-221-header-mobile
- hotfix/LAB-310-crash-home

Fluxo padrão de trabalho:

1. criar branch a partir da main atualizada;
2. desenvolver em commits pequenos (Conventional Commits);
3. abrir PR cedo, antes da branch ficar grande;
4. passar em CI (build, lint e testes);
5. obter aprovação de pelo menos 1 revisor;
6. fazer merge via squash;
7. deletar branch após merge.

Regras de proteção da main:

- sem push direto na main;
- PR obrigatória para merge;
- status checks obrigatórios (build, lint e testes);
- histórico linear via squash/rebase.

Boas práticas para evitar gargalo:

- manter branches curtas (ideal: 1 a 2 dias);
- atualizar branch frequentemente com a main;
- usar feature flags para código ainda não finalizado;
- preferir PRs pequenos e focados.

## Boas práticas

- Commits no padrão Conventional Commits.
- Pull requests pequenos por feature.
- Garantir build e testes passando antes de abrir PR.
- Rodar ESLint e Prettier antes de enviar alterações.

## Referências

- Angular CLI: https://angular.dev/tools/cli
- Conventional Commits: https://www.conventionalcommits.org/en/v1.0.0/
- GitHub Actions: https://docs.github.com/pt/actions

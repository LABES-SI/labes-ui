# SIE Frontend

Frontend do SIE - Sintese de Indicadores Educacionais.

O SIE e um Observatorio de Dados Educacionais para consulta de indicadores, filtros, graficos, tabelas e informacoes sobre escolas.

## Stack

- Angular 21
- Standalone components
- Angular Router
- SCSS
- Signals e computed
- ESLint
- Prettier
- Husky
- GitHub Actions

## Pre-requisitos

- Node.js 22
- npm 10+

## Setup

```bash
npm install
npm start
```

Aplicacao local:

```text
http://localhost:4200/
```

## Scripts

```bash
npm start
```

Sobe o servidor de desenvolvimento.

```bash
npm run lint
```

Valida codigo TypeScript e templates Angular.

```bash
npm run format:check
```

Verifica formatacao com Prettier.

```bash
npm run format
```

Aplica formatacao com Prettier.

```bash
npm run test:ci
```

Executa testes em modo CI.

```bash
npm run build
```

Gera build de producao.

```bash
npm run validate
```

Executa lint, format check, testes e build.

## Estrutura

```text
src/app/
  core/
    layout/
      header/
      footer/
    services/

  shared/
    components/

  features/
    inicio/
    sobre/

  app.routes.ts
  app.component.ts
```

Rotas principais:

- `/` redireciona para `/inicio`
- `/inicio` carrega a pagina Inicio
- `/sobre` carrega a pagina Sobre

## Padroes Do Projeto

Documentos principais:

- [Convencoes de frontend](docs/conventions.md)
- [Guia de contribuicao](docs/contributing.md)
- [Contexto para IA](docs/ai-context.md)

Regras centrais:

- arquitetura feature-based;
- pastas tecnicas em ingles;
- features, classes, arquivos e dominio em portugues;
- `core/layout` para Header e Footer;
- `shared/components` para componentes reutilizaveis;
- `features/<feature>/facades` para ponte com dados;
- nao criar `data-access/`;
- pages e components nao acessam API diretamente.

## Qualidade

Husky roda validacoes automaticamente:

- `pre-commit`: `npm run lint` e `npm run format:check`
- `pre-push`: `npm run test:ci` e `npm run build`

CI no GitHub Actions:

- `npm ci`
- `npm run lint`
- `npm run test:ci`
- `npm run build`

Antes de abrir PR, rode:

```bash
npm run validate
```

## Fluxo De PR

1. Crie uma branch curta a partir da `main`.
2. Desenvolva seguindo `docs/conventions.md`.
3. Rode `npm run validate`.
4. Abra PR usando o template do repositorio.
5. Aguarde CI e revisao.

Padrao de branch:

```text
feature/SIE-12-pagina-indicadores
fix/SIE-18-menu-mobile
docs/guia-contribuicao
```

Padrao de commit:

```text
feat: adiciona estrutura da pagina de indicadores
fix: corrige navegacao do header
docs: atualiza guia de contribuicao
```

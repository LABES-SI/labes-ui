# Guia de Contribuicao - SIE Frontend

Este guia descreve o fluxo recomendado para desenvolver, validar e abrir PRs no frontend do SIE.

## Setup Local

```bash
npm install
npm start
```

A aplicacao roda por padrao em:

```text
http://localhost:4200/
```

## Uso De IA

Se usar IA para desenvolver features ou refactors, siga tambem:

- [Contexto para IA](ai-context.md)

Antes de aceitar codigo gerado por IA, revise a arquitetura, confira se nao foram criadas pastas duplicadas e rode `npm run validate`.

## Scripts Principais

```bash
npm run lint
```

Valida TypeScript e templates Angular com ESLint.

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

Executa a validacao completa: lint, format check, testes e build.

## Husky

O projeto usa Husky para validar codigo antes de commit e push.

No `pre-commit`:

```bash
npm run lint
npm run format:check
```

No `pre-push`:

```bash
npm run test:ci
npm run build
```

Se um hook falhar, corrija o erro e repita o commit ou push.

## Fluxo De Branch

Use branches curtas a partir da `main` atualizada.

Padroes:

```text
feature/<ticket>-<descricao>
fix/<ticket>-<descricao>
hotfix/<ticket>-<descricao>
docs/<descricao>
refactor/<descricao>
```

Exemplos:

```text
feature/SIE-12-pagina-indicadores
fix/SIE-18-menu-mobile
docs/guia-contribuicao
```

## Como Subir Uma Feature

1. Atualize a `main`.

```bash
git checkout main
git pull origin main
```

2. Crie a branch.

```bash
git checkout -b feature/SIE-12-pagina-indicadores
```

3. Desenvolva seguindo `docs/conventions.md`.
4. Rode a validacao completa.

```bash
npm run validate
```

5. Faça commits pequenos e claros.

```bash
git add .
git commit -m "feat: adiciona estrutura da pagina de indicadores"
```

6. Envie a branch.

```bash
git push origin feature/SIE-12-pagina-indicadores
```

7. Abra um pull request para `main`.

## Padrao De Commit

Use Conventional Commits.

Tipos comuns:

- `feat`: nova funcionalidade;
- `fix`: correcao;
- `docs`: documentacao;
- `refactor`: refatoracao sem mudanca de comportamento;
- `test`: testes;
- `style`: formatacao sem mudanca de comportamento;
- `chore`: manutencao.

Exemplos:

```text
feat: adiciona facade de indicadores
fix: corrige rota inicial para inicio
docs: adiciona guia de contribuicao
refactor: remove estrutura antiga de home
```

## Checklist De Pull Request

Antes de abrir PR:

- A branch foi criada a partir da `main` atualizada.
- A mudanca esta pequena e focada.
- A arquitetura segue `docs/conventions.md`.
- Nao existem pastas duplicadas com a mesma responsabilidade.
- Nao existe `data-access/`.
- `npm run validate` passa localmente.
- A descricao do PR explica o que mudou e como testar.

## Revisao De Codigo

O revisor deve observar:

- se a feature esta isolada em `features/<feature>`;
- se componentes compartilhados estao em `shared/components`;
- se itens globais estao em `core`;
- se pages nao acessam API diretamente;
- se components sao apresentacionais quando possivel;
- se a facade isola acesso a dados;
- se nomes e pastas seguem o padrao do projeto.

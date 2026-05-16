# Contexto Para IA - SIE Frontend

Use este arquivo como contexto unico ao solicitar tarefas para uma IA no frontend do SIE. A IA deve cumprir a tarefa pedida e seguir estas regras.

## Projeto

O SIE - Sintese de Indicadores Educacionais - e um Observatorio de Dados Educacionais.

Frontend em Angular moderno, com:

- standalone components;
- Angular Router;
- SCSS;
- Signals e `computed()` quando houver estado local;
- `input()` e `output()` em componentes novos;
- `ChangeDetectionStrategy.OnPush`;
- arquitetura feature-based.

## Estrutura Padrao

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
    <feature>/
      pages/
      components/
      facades/
      models/
      mappers/
      <feature>.routes.ts
```

Pastas tecnicas ficam em ingles. Features, arquivos, classes e dominio ficam em portugues.

Exemplos: `inicio`, `sobre`, `indicadores`, `InicioPageComponent`, `IndicadoresFacade`.

## Regras Essenciais

- `core` e para elementos globais.
- `shared/components` e para componentes reutilizaveis e genericos.
- `features/<feature>` concentra o codigo da area funcional.
- Pages compoem tela, chamam facades, controlam loading/erro e passam dados para components.
- Components devem ser preferencialmente apresentacionais.
- Components recebem dados por `input()` e emitem eventos por `output()`.
- Facades sao a ponte entre a feature e os dados.
- Enquanto nao houver API, facades podem retornar mocks com `Observable` e `of()`.
- Mappers devem ser funcoes puras.
- Pages e components nao acessam API diretamente.
- A aplicacao inicia em `/inicio`.

## Nao Fazer

- Nao criar `data-access/`.
- Nao criar `shared/ui`.
- Nao criar `core/layouts`.
- Nao recriar `features/home`.
- Nao duplicar pastas com a mesma responsabilidade.
- Nao acessar `HttpClient` em page/component.
- Nao importar DTO de API em page/component.
- Nao importar mapper em page/component.
- Nao colocar regra de negocio complexa em component.
- Nao alterar lint, build, CI ou Husky sem pedido explicito.
- Nao misturar refactor amplo com feature pequena.
- Nao mexer em arquivos nao relacionados.

## Rotas

Rotas atuais:

- `''` redireciona para `/inicio`;
- `/inicio` carrega a feature `inicio`;
- `/sobre` carrega a feature `sobre`;
- `**` redireciona para `/inicio`.

Cada feature roteavel deve ter `<feature>.routes.ts`. Ao criar rota publica, registrar lazy loading em `src/app/app.routes.ts`.

## Fluxo De Trabalho Para IA

1. Ler a estrutura existente antes de editar.
2. Identificar o menor conjunto de arquivos necessario.
3. Seguir os padroes atuais do projeto.
4. Fazer mudanca pequena e focada.
5. Nao criar estrutura paralela.
6. Atualizar rotas apenas quando necessario.
7. Atualizar docs apenas quando a tarefa envolver arquitetura, fluxo ou padrao.
8. Rodar validacoes finais.
9. Informar arquivos alterados e validacoes executadas.

## Validacoes

Antes de finalizar, rodar:

```bash
npm run lint
npm run format:check
npm run test:ci
npm run build
```

Ou:

```bash
npm run validate
```

Se `format:check` falhar:

```bash
npm run format
npm run validate
```

Se alguma validacao nao puder ser executada, informar o motivo.

## Husky E PR

Husky roda:

- `pre-commit`: `npm run lint` e `npm run format:check`;
- `pre-push`: `npm run test:ci` e `npm run build`.

Antes de abrir PR:

- manter a mudanca pequena e focada;
- confirmar que nao existe pasta duplicada;
- confirmar que nao existe `data-access/`;
- confirmar que pages/components nao acessam API diretamente;
- rodar `npm run validate`;
- preencher o template de PR.

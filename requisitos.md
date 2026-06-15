# Requisitos Funcionais — Observatório de Dados Educacionais

Priorização MoSCoW: MUST / SHOULD / COULD / WON'T.
Os itens **WON'T** estão fora do escopo desta entrega — não precisam ser implementados, apenas registrados como não atendidos por decisão de escopo.

Camada sugerida: **FE** = frontend, **BE** = backend, **Misto** = lógica no backend com exibição/disparo no frontend.

## F1 — Integração de Dados

- **RF01** (MUST, BE): Importar dados do Censo Escolar e do IDEB (nota apenas) de fontes públicas oficiais e PIBID.
- **RF02** (MUST, BE): Padronizar os identificadores das escolas para garantir consistência entre bases.
- **RF03** (MUST, BE): Permitir o cruzamento entre diferentes bases de dados educacionais.
- **RF04** (MUST, BE): Armazenar os dados integrados em uma base única e centralizada.
- **RF05** (MUST, BE): Tratar automaticamente inconsistências e valores ausentes.
- **RF06** (MUST, BE): Utilizar exclusivamente dados públicos e oficiais.

## F2 — Comparação entre Escolas

- **RF07** (MUST, FE): Seleção de múltiplas escolas para comparação simultânea.
- **RF08** (MUST, FE): Comparação de escolas por localização urbana e rural.
- **RF09** (MUST, FE): Comparação de indicadores (IDEB, evasão, fluxo) entre escolas selecionadas.
- **RF10** (MUST, FE): Exibir comparações em gráficos de barras, linhas e outros formatos.
- **RF11** (MUST, FE): Comparação entre redes de ensino municipal, estadual e privada.

## F3 — Análise Temporal

- **RF12** (SHOULD, FE): Exibir evolução histórica dos indicadores por escola.
- **RF13** (SHOULD, FE): Permitir seleção de intervalos de tempo para análise.
- **RF14** (SHOULD, FE): Exibir dados em gráficos de linha e séries temporais.
- **RF15** (SHOULD, FE): Permitir comparação temporal entre escolas e redes.
- **RF16** (SHOULD, FE): Permitir seleção de períodos correspondentes a programas/políticas.

## F4 — Padrões e Tendências

- **RF17** (COULD, Misto): Identificar automaticamente tendências de crescimento ou queda.
- **RF18** (COULD, Misto): Destacar situações críticas ou relevantes nos dados.
- **RF19** (COULD, FE): Permitir filtragem de análises por escola, rede, localidade e período.
- **RF20** (COULD, FE): Representar padrões e tendências de forma visual por gráficos.
- **RF21** (COULD, Misto): Identificar padrões recorrentes ao longo do tempo.

## F5 — Desempenho por Rede

- **RF22** (COULD, FE): Exibir indicadores organizados por rede de ensino.
- **RF23** (COULD, FE): Permitir comparação lado a lado entre redes.
- **RF24** (COULD, FE): Permitir filtragem por ano, região e etapa de ensino.
- **RF25** (COULD, FE): Exibir comparações de desempenho entre redes em gráficos.
- **RF26** (COULD, FE): Permitir análise temporal do desempenho por rede.

## F6 — Fatores Socioeconômicos (WON'T — fora de escopo)

- **RF27** (WON'T, FE): Exibir dados socioeconômicos associados às escolas e regiões.
- **RF28** (WON'T, Misto): Permitir correlação entre fatores socioeconômicos e indicadores.
- **RF29** (WON'T, FE): Permitir comparação entre áreas com contextos socioeconômicos distintos.
- **RF30** (WON'T, FE): Permitir filtragem por região, escola e período.
- **RF31** (WON'T, FE): Apresentar visualizações entre contexto socioeconômico e desempenho.

## F7 — Perfil das Escolas

- **RF32** (SHOULD, FE): Exibir informações completas do perfil das escolas.
- **RF33** (SHOULD, FE): Permitir filtragem de escolas por características institucionais.
- **RF34** (SHOULD, FE): Permitir comparação de perfis entre diferentes escolas.
- **RF35** (SHOULD, Misto): Relacionar o perfil institucional com seus indicadores.
- **RF36** (SHOULD, FE): Apresentar visualizações claras do perfil.

## F8 — Rastreabilidade

- **RF37** (MUST, FE): Exibir a fonte de cada dado ou indicador no painel.
- **RF38** (MUST, FE): Exibir a data de atualização de cada dado.
- **RF39** (MUST, Misto): Notificar o usuário quando os dados de uma escola estiverem desatualizados.
- **RF40** (MUST, Misto): Permitir rastreamento da origem de cada indicador.

## F9 — Glossário

- **RF41** (MUST, FE): Disponibilizar glossário com definição de cada indicador.
- **RF42** (MUST, FE): Exibir explicações simples e exemplos práticos.
- **RF43** (MUST, FE): Permitir filtragem dos indicadores por categoria (desempenho, fluxo, infraestrutura).
- **RF44** (MUST, FE): Integrar o glossário ao painel, permitindo consulta sem sair da tela.
- **RF45** (MUST, FE): Incluir referências à metodologia oficial do INEP.

## F10 — Integração de Dados (Incrementos PIBID/UFPA)

- **RF46** (MUST, BE): Integrar a base interna do PIBID/UFPA (quantitativo de bolsistas por escola) à base unificada.
- **RF47** (MUST, Misto): Permitir exibição de investimento financeiro por instituição parceira (condicionado à liberação dos dados).

## F11 — Comparação entre Escolas e Indicadores (Contexto)

- **RF48** (MUST, Misto): Módulo de comparação direta entre escolas com PIBID ativo vs. sem o programa.
- **RF49** (MUST, FE): Filtragem avançada por disciplina, zona, rede, etapa e tipo de escola.
- **RF50** (MUST, FE): Sinalizar visualmente a copresença de outros programas (ex: Residência Pedagógica).

## F12 — Mapa Interativo das Escolas Parceiras

- **RF51** (MUST, FE): Renderizar mapa interativo com a distribuição geográfica das escolas PIBID/UFPA em Belém.
- **RF52** (MUST, FE): Filtrar e clicar nos marcadores para abrir resumo de indicadores e série histórica.

## F13 — Exportação de Dados e Relatórios

- **RF53** (MUST, Misto): Exportar e baixar qualquer tabela/série/matriz exibida na tela em CSV e XLSX.

## F14 — Infraestrutura e Acessibilidade Escolar

- **RF54** (—, FE): Filtrar escolas por recursos de acessibilidade e infraestrutura.
- **RF55** (—, FE): Exibir ranking das escolas de um município por recursos de acessibilidade.
- **RF56** (—, FE): Gráfico de distribuição das escolas por dependência administrativa.
- **RF57** (—, FE): Detalhamento das escolas que compõem os indicadores nos gráficos e cartões.
- **RF58** (—, FE): Exibir tabela consolidada de infraestrutura das escolas de um município.
- **RF59** (—, Misto): Exportar relação de escolas e indicadores de infraestrutura/acessibilidade.
- **RF60** (—, Misto): Análise comparativa entre escolas com e sem determinado recurso.
- **RF61** (—, FE): Exibir destinação de lixo da escola, indicando se possui o recurso/informação registrada. _(linha sem número no CSV original)_

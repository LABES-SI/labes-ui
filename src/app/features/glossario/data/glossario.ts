import { TermoGlossario, TermoGlossarioEntrada } from '../models/glossario.models';

/**
 * Gera um id amigável e seguro para URL a partir do termo ou chave original.
 */
function gerarIdGlossario(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Garante que todos os termos tenham id único.
 */
function adicionarIdsUnicos(termos: TermoGlossarioEntrada[]): TermoGlossario[] {
  const idsUsados = new Set<string>();

  return termos.map((termo, index) => {
    const idBaseGerado = gerarIdGlossario(termo.chaveOriginal || termo.termo);
    const baseId = termo.id || idBaseGerado || `termo-${index + 1}`;
    let idFinal = baseId;

    let contador = 2;
    while (idsUsados.has(idFinal)) {
      idFinal = `${baseId}-${contador}`;
      contador++;
    }

    idsUsados.add(idFinal);

    return {
      ...termo,
      id: idFinal,
    };
  });
}

/**
 * Base de dados oficial e unificada do Glossário do SIE.
 * Contém a mescla completa exigida pelos Cards 18 e 19:
 * - Indicadores pedagógicos de alto nível do painel (ex: IDEB, Evasão)
 * - Variáveis técnicas e estruturais extraídas do Censo Escolar e planilhas
 */
const GLOSSARIO_ENTRADA: TermoGlossarioEntrada[] = [
  // =========================================================================
  // --- 1. INDICADORES DO PAINEL EXTERNO (Card 19)
  // =========================================================================
  {
    termo: 'Índice de Desenvolvimento da Educação Básica (IDEB)',
    chaveOriginal: 'IDEB',
    definicao:
      'Indicador nacional que avalia de forma unificada a qualidade do ensino público no país. É calculado a cada dois anos cruzando as médias de proficiência dos estudantes em exames nacionais (SAEB) com as taxas de aprovação escolar obtidas no Censo. O índice varia de 0 a 10.',
    categoria: 'desempenho',
    exemplo:
      'Uma escola pública que atinge o índice médio de 6.0 no IDEB, demonstrando progresso pedagógico e alta taxa de aprovação regular.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb',
      texto: 'Metodologia Oficial do IDEB - INEP',
    },
  },
  {
    termo: 'Proficiência em Língua Portuguesa (SAEB)',
    chaveOriginal: 'PROFICIENCIA_PORTUGUES_SAEB',
    definicao:
      'Nota média padronizada que reflete a capacidade dos estudantes em leitura, interpretação de textos, criticidade literária e compreensão das regras da língua, medida através de avaliações nacionais externas.',
    categoria: 'desempenho',
    exemplo:
      'As turmas de 5.º ano obtiveram uma pontuação média de 220 pontos na escala de proficiência do SAEB.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-da-educacao-basica/saeb',
      texto: 'Escalas de Avaliação do SAEB',
    },
  },
  {
    termo: 'Proficiência em Matemática (SAEB)',
    chaveOriginal: 'PROFICIENCIA_MATEMATICA_SAEB',
    definicao:
      'Desempenho médio alcançado pelos alunos na resolução de problemas práticos, raciocínio lógico-matemático e geometria plana durante as edições do Sistema de Avaliação da Educação Básica.',
    categoria: 'desempenho',
    exemplo:
      'A pontuação média de uma escola em Matemática subiu de 210 para 225 pontos entre duas edições consecutivas do exame.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-da-educacao-basica/saeb',
      texto: 'Escalas de Avaliação do SAEB',
    },
  },
  {
    termo: 'Adequação da Formação Docente',
    chaveOriginal: 'TP_FORMACAO_DOCENTE',
    definicao:
      'Porcentagem de professores em atividade na escola que possuem formação de nível superior de licenciatura adequada para a disciplina que lecionam em sala de aula.',
    categoria: 'desempenho',
    exemplo:
      'A escola possui 95% dos docentes com formação superior específica em sua respectiva disciplina de atuação.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/indicadores-educacionais',
      texto: 'Indicadores de Adequação Docente',
    },
  },
  {
    termo: 'Taxa de Evasão Escolar (Abandono)',
    chaveOriginal: 'TAXA_EVASAO',
    definicao:
      'Proporção de estudantes que deixaram de frequentar as aulas e não realizaram a renovação de matrícula ao longo do ano letivo de forma ativa. É calculada dividindo o número de abandonos pela matrícula inicial.',
    categoria: 'fluxo',
    exemplo:
      'A taxa de evasão de uma escola com 300 estudantes foi reduzida para apenas 1.2% através de programas de busca ativa escolar.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/indicadores-educacionais',
      texto: 'Indicadores de Rendimento e Fluxo',
    },
  },
  {
    termo: 'Taxa de Aprovação',
    chaveOriginal: 'TAXA_APROVACAO',
    definicao:
      'Porcentagem de alunos matriculados que, ao final do ano letivo, alcançaram com sucesso todos os objetivos de nota e mantiveram frequência escolar mínima regulamentar de 75%.',
    categoria: 'fluxo',
    exemplo:
      'Ações de acompanhamento individual dos estudantes que elevaram a taxa de aprovação anual para 94%.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/indicadores-educacionais',
      texto: 'Indicadores de Rendimento e Fluxo',
    },
  },
  {
    termo: 'Taxa de Reprovação',
    chaveOriginal: 'TAXA_REPROVACAO',
    definicao:
      'Proporção de alunos que não conseguiram satisfazer os requisitos letivos ou que ultrapassaram o limite de faltas regulamentar no ano corrente, necessitando de repetir a mesma série.',
    categoria: 'fluxo',
    exemplo:
      'Com o apoio pedagógico contínuo nas salas de reforço, a taxa de reprovação escolar diminuiu para menos de 5%.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/indicadores-educacionais',
      texto: 'Indicadores de Rendimento e Fluxo',
    },
  },
  {
    termo: 'Distorção Idade-Série',
    chaveOriginal: 'TAXA_DISTORCAO_IDADE_SERIE',
    definicao:
      'Porcentagem de alunos matriculados em uma determinada turma que possuem atraso escolar igual ou superior a 2 anos em relação à idade oficial recomendada para aquela série.',
    categoria: 'fluxo',
    exemplo:
      'Alunos com 12 anos de idade que ainda frequentam o 4.º ano do Ensino Fundamental (onde a idade esperada seria de 9 anos).',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/indicadores-educacionais',
      texto: 'Distorção Idade-Série INEP',
    },
  },
  {
    termo: 'Média de Alunos por Turma',
    chaveOriginal: 'MEDIA_ALUNOS_TURMA',
    definicao:
      'Média geral de alunos agrupados em regime de aula regular numa única turma, calculada dividindo o número total de matrículas pelo quantitativo de turmas ativas no censo.',
    categoria: 'fluxo',
    exemplo:
      'A redução do indicador médio de 40 para 25 alunos por turma favoreceu a personalização do ensino do professor.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/indicadores-educacionais',
      texto: 'Média de Alunos por Turma - INEP',
    },
  },
  {
    termo: 'Acessibilidade Predial Escolar',
    chaveOriginal: 'IN_ACESSIBILIDADE_COMPLETA',
    definicao:
      'Indicador do Censo Escolar que atesta a disponibilidade simultânea de múltiplos recursos estruturais que facilitem a livre locomoção física, como rampas, corrimãos, pisos táteis e banheiros adaptados.',
    categoria: 'infraestrutura',
    exemplo:
      'Uma escola que adaptou as portas para permitir a passagem de cadeiras de rodas e instalou piso tátil na entrada.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Conectividade para Uso Pedagógico',
    chaveOriginal: 'IN_CONECTIVIDADE_ALUNOS',
    definicao:
      'Mede a disponibilidade e a qualidade de acesso à internet de banda larga de alta velocidade nas escolas, especificamente voltada para atividades letivas e de aprendizagem dos alunos.',
    categoria: 'infraestrutura',
    exemplo:
      'Instalação de rede Wi-Fi de alta velocidade em todas as salas de aula para viabilizar pesquisas pedagógicas online.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Taxa de Atendimento Escolar',
    chaveOriginal: 'TAXA_ATENDIMENTO_ESCOLAR',
    definicao:
      'Porcentagem da população de uma determinada faixa etária, como 4 a 17 anos, que está efetivamente matriculada e frequentando uma instituição de ensino no município ou estado.',
    categoria: 'fluxo',
    exemplo:
      'Se um município tem 1.000 jovens de 15 a 17 anos e 950 estão matriculados na escola, a taxa de atendimento para este grupo é de 95%.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },

  // =========================================================================
  // --- 2. VARIÁVEIS TÉCNICAS E DE PLANILHA (Card 18)
  // =========================================================================
  {
    termo: 'Corrimãos Acessíveis',
    chaveOriginal: 'IN ACESSIBILIDADE CORRIMAO',
    definicao:
      'Indica se a escola possui corrimãos ou guarda-corpos adequados e acessíveis nas rampas e escadas para apoio físico.',
    categoria: 'infraestrutura',
    exemplo: 'Presença de corrimão duplo com alturas sinalizadas em rampas de acesso comum.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Elevador Acessível',
    chaveOriginal: 'IN_ACESSIBILIDADE_ELEVADOR',
    definicao:
      'Indica a existência de elevadores ou plataformas elevatórias adaptadas para o deslocamento vertical de pessoas com deficiência ou mobilidade reduzida.',
    categoria: 'infraestrutura',
    exemplo:
      'Escolas de múltiplos pavimentos que possuem elevador funcional adaptado com painel em Braille.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Piso Tátil',
    chaveOriginal: 'IN ACESSIBILIDADE PISOS TATEIS',
    definicao:
      'Indica a presença de pisos táteis de alerta e direcionamento para orientação espacial de pessoas com deficiência visual.',
    categoria: 'infraestrutura',
    exemplo:
      'Faixas amarelas em relevo no chão ligando a entrada principal da escola até as salas de aula.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Rampas de Acesso',
    chaveOriginal: 'IN ACESSIBILIDADE RAMPAS',
    definicao:
      'Indica a existência de rampas de acesso com inclinação adequada e sinalização tátil para garantir a transposição de desníveis.',
    categoria: 'infraestrutura',
    exemplo: 'Rampa de entrada com corrimão duplo substituindo ou complementando degraus.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Portas e Passagens Acessíveis',
    chaveOriginal: 'IN_ACESSIBILIDADE_VAO_LIVRE',
    definicao:
      'Indica que as portas e rotas de passagem da escola possuem largura de vão livre mínima adequada para passagem de cadeiras de rodas (mínimo de 80cm).',
    categoria: 'infraestrutura',
    exemplo:
      'Portas de salas de aula e banheiros alargadas de acordo com as normas de acessibilidade.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Total de Salas Acessíveis',
    chaveOriginal: 'QT_SALAS_UTILIZADAS_ACESSIVEIS',
    definicao:
      'Quantidade total de salas de aula e dependências de uso pedagógico adaptadas para receber alunos com necessidades especiais de locomoção.',
    categoria: 'infraestrutura',
    exemplo: 'Escola que possui 5 de suas 10 salas totalmente livres de obstáculos e degraus.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Sem Acessibilidade Arquitetônica',
    chaveOriginal: 'IN ACESSIBILIDADE INEXISTENTE',
    definicao:
      'Marcador lógico que indica a total ausência de qualquer recurso físico ou arquitetônico de acessibilidade nas dependências internas ou externas da instituição escolar.',
    categoria: 'infraestrutura',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Sinalização Sonora',
    chaveOriginal: 'IN ACESSIBILIDADE SINAL SONORO',
    definicao:
      'Indica a existência de sinalização sonora ou alarmes adaptados para guiar, instruir e alertar estudantes com deficiência visual.',
    categoria: 'infraestrutura',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Sinalização Tátil',
    chaveOriginal: 'IN ACESSIBILIDADE SINAL TATIL',
    definicao:
      'Indica a existência de placas em Braille, mapas táteis e sinalização física de relevo nas portas e corrimãos das dependências da escola.',
    categoria: 'infraestrutura',
    exemplo: 'Placas indicadoras de "Biblioteca" e "Diretoria" com escrita em Braille.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Sinalização Visual Adaptada',
    chaveOriginal: 'IN ACESSIBILIDADE SINAL VISUAL',
    definicao:
      'Indica a existência de alarmes visuais intermitentes, faixas zebradas contrastantes em degraus e mapas de alta legibilidade para portadores de deficiência auditiva ou baixa visão.',
    categoria: 'infraestrutura',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Tipo de Atendimento Especial (AEE)',
    chaveOriginal: 'TP AEE',
    definicao:
      'Informa o tipo de suporte ou Atendimento Educacional Especializado (AEE) que a instituição oferece de forma estruturada nas salas de recursos multifuncionais.',
    categoria: 'infraestrutura',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Manual do Censo Escolar',
    },
  },
  {
    termo: 'Sala de Atendimento Especial',
    chaveOriginal: 'IN SALA ATENDIMENTO ESPECIAL',
    definicao:
      'Indica se a escola possui sala de recursos multifuncionais ativa e equipada com materiais didáticos e pedagógicos voltados ao atendimento de Pessoas com Deficiência.',
    categoria: 'infraestrutura',
    exemplo:
      'Presença de sala com computadores adaptados, lupas eletrônicas e jogos pedagógicos inclusivos.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Reserva de Vagas para PCD',
    chaveOriginal: 'IN RESERVA PCD',
    definicao:
      'Informa se a escola possui e pratica políticas regimentais ou públicas de reserva de vagas de matrículas destinadas exclusivamente a Pessoas com Deficiência (PCD).',
    categoria: 'infraestrutura',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Total de Assistentes Sociais',
    chaveOriginal: 'QT_PROF_ASSIST_SOCIAL',
    definicao:
      'Quantidade total de profissionais graduados em Serviço Social em atuação permanente na equipe multidisciplinar de apoio ao estudante na escola.',
    categoria: 'infraestrutura',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Total de Psicólogos Escolares',
    chaveOriginal: 'QT_PROF_PSICOLOGO',
    definicao:
      'Quantidade de profissionais formados em Psicologia que atuam diretamente no acompanhamento e desenvolvimento psicossocial dos alunos.',
    categoria: 'infraestrutura',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Acesso à Internet via Computadores',
    chaveOriginal: 'IN ACESSO INTERNET COMPUTADOR',
    definicao:
      'Indica se os computadores fixos disponibilizados pela instituição possuem acesso e tráfego à rede de dados externa para atividades didáticas ou administrativas.',
    categoria: 'infraestrutura',
    exemplo:
      'Internet banda larga de 50 Mega cabeada até as máquinas do laboratório de informática.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Acesso à Internet via Dispositivos Pessoais',
    chaveOriginal: 'IN_ACES_INTERNET_DISP_PESSOAIS',
    definicao:
      'Indica a presença de rede Wi-Fi aberta ou autenticada que autoriza a conexão e navegação de dispositivos pessoais de alunos, professores e funcionários.',
    categoria: 'infraestrutura',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Tipo de Rede Local',
    chaveOriginal: 'TP REDE LOCAL',
    definicao:
      'Classificação técnica do tipo de rede local estabelecida nas dependências da escola (rede cabeada, rede sem fio/Wi-Fi, ambas ou inexistente).',
    categoria: 'infraestrutura',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Possui Computadores',
    chaveOriginal: 'IN COMPUTADOR',
    definicao:
      'Indicador de presença física de computadores de qualquer natureza (desktop, notebook, chromebook ou tablet) para uso geral na escola.',
    categoria: 'infraestrutura',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Computadores de Mesa para Alunos',
    chaveOriginal: 'IN DESKTOP ALUNO',
    definicao:
      'Indica a existência de computadores de mesa tradicionais (Desktops) instalados e dedicados exclusivamente para o uso pedagógico dos estudantes.',
    categoria: 'infraestrutura',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Total de Computadores de Mesa',
    chaveOriginal: 'QT_DESKTOP_ALUNO',
    definicao:
      'Quantidade exata de equipamentos desktop em funcionamento destinados às atividades práticas dos estudantes.',
    categoria: 'infraestrutura',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Notebooks para Alunos',
    chaveOriginal: 'IN_COMP_PORTATIL_ALUNO',
    definicao:
      'Indica a existência de computadores portáteis do tipo notebook ou chromebook destinados exclusivamente para uso didático dos alunos.',
    categoria: 'infraestrutura',
    exemplo:
      'Uso de notebooks pedagógicos móveis para a realização de oficinas e pesquisas científicas em sala.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Total de Notebooks para Alunos',
    chaveOriginal: 'QT_COMP_PORTATIL_ALUNO',
    definicao:
      'Quantidade total física de computadores portáteis inventariados e funcionais disponíveis para a comunidade estudantil.',
    categoria: 'infraestrutura',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Tablets para Alunos',
    chaveOriginal: 'IN TABLET ALUNO',
    definicao:
      'Indica se a escola possui e distribui tablets para uso e desenvolvimento de atividades escolares interativas e leitura digital.',
    categoria: 'infraestrutura',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Total de Tablets para Alunos',
    chaveOriginal: 'QT_TABLET_ALUNO',
    definicao:
      'Quantidade total física de dispositivos móveis do tipo tablet inventariados, carregados e funcionais disponíveis na escola.',
    categoria: 'infraestrutura',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'IDEB Histórico (2005)',
    chaveOriginal: 'IDEB(2005)',
    definicao:
      'Mapeamento do valor absoluto histórico obtido pela escola no primeiro ano de apuração e formulação oficial do IDEB nacional.',
    categoria: 'desempenho',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb',
      texto: 'Série Histórica IDEB',
    },
  },
  {
    termo: 'IDEB Histórico Recente (2023)',
    chaveOriginal: 'IDEB(2023)',
    definicao:
      'Valor absoluto alcançado pela instituição de ensino na apuração mais recente divulgada do IDEB nacional.',
    categoria: 'desempenho',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb',
      texto: 'Série Histórica IDEB',
    },
  },
  {
    termo: 'Participação no PIBID',
    chaveOriginal: 'pibid',
    definicao:
      'Marcador binário que indica a participação ativa da escola no Programa Institucional de Bolsa de Iniciação à Docência (PIBID).',
    categoria: 'desempenho',
    exemplo:
      'As escolas municipais parceiras recebem bolsistas de licenciaturas públicas da região para imersão acadêmica.',
    referenciaInep: {
      url: 'https://www.gov.br/capes/pt-br/acesso-a-informacao/acoes-e-programas/educacao-basica/pibid',
      texto: 'Portal CAPES',
    },
  },
  {
    termo: 'Área do Subprojeto PIBID',
    chaveOriginal: 'SUBPROJETO',
    definicao:
      'Indica a disciplina pedagógica ou a área acadêmica específica em que as atividades de iniciação docente estão sendo aplicadas (ex: Matemática, Biologia, Pedagogia).',
    categoria: 'desempenho',
    referenciaInep: {
      url: 'https://www.gov.br/capes/pt-br/acesso-a-informacao/acoes-e-programas/educacao-basica/pibid',
      texto: 'Portal CAPES',
    },
  },
  {
    termo: 'Total de Bolsistas Ativos',
    chaveOriginal: 'QTD_BOLSISTAS_ATIVOS',
    definicao:
      'Mapeia a quantidade total de alunos bolsistas de graduação em atividade presencial na escola pelo projeto do PIBID.',
    categoria: 'desempenho',
    referenciaInep: {
      url: 'https://www.gov.br/capes/pt-br/acesso-a-informacao/acoes-e-programas/educacao-basica/pibid',
      texto: 'Portal CAPES',
    },
  },
  {
    termo: 'Código da Escola (Código INEP)',
    chaveOriginal: 'CO ENTIDADE',
    definicao:
      'Identificador nacional único e obrigatório de 8 dígitos atribuído pelo INEP a cada instituição de ensino cadastrada e ativa no país.',
    categoria: 'fluxo',
    exemplo:
      'Essencial para preenchimento de censos, requisição de exames do ENEM e liberação de verbas do Fundeb.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Dicionário de Variáveis INEP',
    },
  },
  {
    termo: 'Código da Escola (Perfil Escolar)',
    chaveOriginal: 'CO_ENTIDADE',
    definicao:
      'Código de chave primária que identifica univocamente o registro da instituição na planilha de Perfil Escolar.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Dicionário de Variáveis INEP',
    },
  },
  {
    termo: 'Nome da Escola',
    chaveOriginal: 'NO ENTIDADE',
    definicao:
      'Designação oficial registrada sob a qual a instituição de ensino básico executa as suas atividades letivas.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Dicionário de Variáveis INEP',
    },
  },
  {
    termo: 'Ano do Censo Escolar',
    chaveOriginal: 'NU ANO CENSO',
    definicao:
      'Indica o ano letivo de apuração aos quais os dados e relatórios do Censo se referem de forma retroativa.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Censo Escolar - INEP',
    },
  },
  {
    termo: 'Ano de Referência (PIBID)',
    chaveOriginal: 'ANO',
    definicao:
      'Representa o ano calendário ao qual o registro de bolsas ativas do PIBID se refere.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/capes/pt-br/acesso-a-informacao/acoes-e-programas/educacao-basica/pibid',
      texto: 'Portal CAPES',
    },
  },
  {
    termo: 'Mês de Referência (PIBID)',
    chaveOriginal: 'MES',
    definicao:
      'Representa o mês de competência das folhas de pagamento de bolsas ativas mapeadas pelo programa.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/capes/pt-br/acesso-a-informacao/acoes-e-programas/educacao-basica/pibid',
      texto: 'Portal CAPES',
    },
  },
  {
    termo: 'Código do Município (IBGE)',
    chaveOriginal: 'CO MUNICIPIO',
    definicao:
      'Identificador único de 7 dígitos gerado pelo IBGE para mapear o município de endereço físico da escola.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Portal de Metadados IBGE',
    },
  },
  {
    termo: 'Nome do Município',
    chaveOriginal: 'NO MUNICIPIO',
    definicao: 'O nome do município onde a escola está localizada territorialmente.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Dicionário de Variáveis INEP',
    },
  },
  {
    termo: 'Sigla do Estado (UF)',
    chaveOriginal: 'SG UF',
    definicao:
      'As duas letras maiúsculas que representam a Unidade Federativa estadual (ex: PA, SP, RJ) onde a escola está inserida.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Dicionário de Variáveis INEP',
    },
  },
  {
    termo: 'Nome do Estado',
    chaveOriginal: 'NO_UF',
    definicao: 'O nome completo e legível do estado em que a escola se situa no país.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Dicionário de Variáveis INEP',
    },
  },
  {
    termo: 'Região do Brasil',
    chaveOriginal: 'NO REGIAO',
    definicao:
      'Nome por extenso da macroregião geográfica do Brasil em que a escola reside (Norte, Nordeste, Centro-Oeste, Sudeste, Sul).',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'IBGE',
    },
  },
  {
    termo: 'Mesorregião Geográfica',
    chaveOriginal: 'NO_MESORREGIAO',
    definicao:
      'Região estatística unificada pelo IBGE dentro de um mesmo estado, combinando municípios com semelhanças econômicas.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'IBGE',
    },
  },
  {
    termo: 'Microrregião Geográfica',
    chaveOriginal: 'NO MICRORREGIAO',
    definicao:
      'Subdivisão estatística menor que a mesorregião, unindo municípios geograficamente contíguos.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'IBGE',
    },
  },
  {
    termo: 'CEP da Escola',
    chaveOriginal: 'CO CEP',
    definicao:
      'Código de Endereçamento Postal oficial cadastrado nos Correios para a localidade da instituição.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Dicionário do Censo',
    },
  },
  {
    termo: 'Endereço Completo',
    chaveOriginal: 'DS ENDERECO',
    definicao:
      'Descrição pública de via, avenida ou logradouro onde o portão principal da escola se localiza.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Dicionário do Censo',
    },
  },
  {
    termo: 'Número do Endereço',
    chaveOriginal: 'NU ENDERECO',
    definicao: 'Número de identificação predial da escola na rua informada.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Dicionário do Censo',
    },
  },
  {
    termo: 'Complemento do Endereço',
    chaveOriginal: 'DS COMPLEMENTO',
    definicao:
      'Informações adicionais para localização geográfica exata do lote, bloco ou anexo escolar.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Dicionário do Censo',
    },
  },
  {
    termo: 'Bairro da Escola',
    chaveOriginal: 'NO BAIRRO',
    definicao:
      'Bairro ou subdivisão urbana cadastrada correspondente à localização do imóvel escolar.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Dicionário do Censo',
    },
  },
  {
    termo: 'Código DDD',
    chaveOriginal: 'NU DDD',
    definicao: 'Código de Discagem Direta a Distância de telecomunicação da área local da escola.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Dicionário do Censo',
    },
  },
  {
    termo: 'Dependência Administrativa',
    chaveOriginal: 'TP DEPENDENCIA',
    definicao:
      'Classificação que determina o regime administrativo e gestor da instituição de ensino (Federal, Estadual, Municipal ou Privada).',
    categoria: 'fluxo',
    exemplo:
      'Uma escola gerida e financiada pela secretaria municipal de educação possui Dependência Municipal.',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Dicionário do Censo',
    },
  },
  {
    termo: 'Tipo de Localização',
    chaveOriginal: 'TP LOCALIZACAO',
    definicao:
      'Informa se a escola está geograficamente implantada em perímetro considerado urbano ou rural.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Dicionário do Censo',
    },
  },
  {
    termo: 'Categoria de Escola Privada',
    chaveOriginal: 'TP CATEGORIA ESCOLA PRIVADA',
    definicao:
      'Se aplicável, classifica o tipo de escola privada operando no local: Particular (1), Comunitária (2), Confessional (3) ou Filantrópica (4).',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Dicionário do Censo',
    },
  },
  {
    termo: 'Situação de Funcionamento',
    chaveOriginal: 'TP SITUACAO FUNCIONAMENTO',
    definicao:
      'Status operacional da instituição escolar no momento do fechamento do censo estatístico.',
    categoria: 'fluxo',
    exemplo: 'Escolas em atividade escolar normal pontuam como "Em atividade" (1).',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Dicionário do Censo',
    },
  },
  {
    termo: 'Início do Ano Letivo',
    chaveOriginal: 'DT ANO LETIVO INICIO',
    definicao:
      'Data formal declarada em calendário escolar para o início efetivo das aulas regulares de educação básica na escola.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Manual do Censo Escolar',
    },
  },
  {
    termo: 'Término do Ano Letivo',
    chaveOriginal: 'DT ANO LETIVO TERMINO',
    definicao:
      'Data formal declarada em calendário para o encerramento do ano letivo de educação básica regular.',
    categoria: 'fluxo',
    referenciaInep: {
      url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
      texto: 'Manual do Censo Escolar',
    },
  },
];

export const GLOSSARIO_TERMOS: TermoGlossario[] = adicionarIdsUnicos(GLOSSARIO_ENTRADA);

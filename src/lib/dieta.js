export const AGUA_COPOS = 10
export const AGUA_ML_POR_COPO = 250

export const REFEICOES = [
  {
    id: 'desjejum',
    label: 'Desjejum',
    horario: 'Opcional — ao acordar',
    icon: '🌅',
    tipo: 'fixo',
    descricao: 'Shot imunidade: 1 limão espremido + 1 col café rasa de gengibre em pó ou ralado + 1 col café rasa de cúrcuma em pó + 15 gotas de própolis',
    opcoes: null,
  },
  {
    id: 'cafe',
    label: 'Café da Manhã',
    horario: 'Manhã',
    icon: '☕',
    tipo: 'opcoes',
    descricao: 'Escolha uma das opções:',
    opcoes: [
      'Pão integral (2 fatias) ou pão francês + ovo mexido (3 unidades) ou 4 fatias de queijo branco derretido + suco de laranja',
      'Crepioca (3 col tapioca + 1 col chá de chia + 2 ovos) + banana',
      'Banana com aveia e pasta de amendoim + Iogurte (Verde Campo Whey, Moo, Yorgus ou Iogurte Natural)',
      'Shake: 1 scoop whey protein + fruta + 1 col sopa de farelo de aveia + leite (200 mL)',
    ],
  },
  {
    id: 'lanche_manha',
    label: 'Lanche da Manhã',
    horario: 'Pré-treino',
    icon: '🥪',
    tipo: 'opcoes',
    descricao: 'Pré-treino — escolha uma opção:',
    opcoes: [
      'Sanduíche: 2 fatias de pão integral + frango desfiado com queijo cottage (2 col sopa)',
      'Sanduíche: 2 fatias de pão integral + 4 fatias de rosbife + tomate + rúcula',
      'Crepioca: 2 col sopa de tapioca + 2 ovos + queijo branco',
    ],
  },
  {
    id: 'almoco',
    label: 'Almoço',
    horario: 'Almoço',
    icon: '🍽️',
    tipo: 'estruturado',
    descricao: 'Monte o prato:',
    opcoes: null,
    estrutura: [
      { nome: 'Proteína', detalhe: '150–180g de carne, frango ou peixe (assado ou cozido de preferência)' },
      { nome: 'Carboidrato', detalhe: 'Tubérculos (batata doce, inhame, cará — 5 col sopa) ou abóbora assada (4 pedaços grandes) ou quinua cozida (8 col sopa) ou arroz integral com feijão (8 col sopa de cada)' },
      { nome: 'Legumes cozidos', detalhe: '1 xícara — variar sempre que possível' },
      { nome: 'Salada', detalhe: 'Equivalente a prato de sobremesa — folhas verdes escuras (rúcula, agrião) + mix de castanhas e sementes + bastante azeite de oliva' },
      { nome: 'Sobremesa', detalhe: 'Fruta + 1 col sopa de pasta de amendoim ou chocolate amargo (20g)' },
    ],
    opcoesAlternativas: [
      'Macarrão bolonhesa:

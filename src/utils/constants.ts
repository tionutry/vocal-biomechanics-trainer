export type PhaseId = 1 | 2 | 3;

export interface Phase {
  id: PhaseId;
  title: string;
  tagline: string;
  description: string;
  goals: readonly string[];
  rules: readonly string[];
}

export const PHASES: readonly Phase[] = [
  {
    id: 1,
    title: 'Isolamento',
    tagline: 'Um mecanismo por vez',
    description:
      'Trabalhe cada componente separadamente (respiração, vibração labial, relaxamento de mandíbula e língua) em volume baixo, sem buscar sonoridade.',
    goals: [
      'Perceber um fluxo de ar contínuo e sem esforço',
      'Manter mandíbula, língua e pescoço soltos',
      'Produzir som leve, sem empurrar a garganta',
    ],
    rules: [
      'Volume baixo a moderado, em região confortável da voz',
      'Pare ao primeiro sinal de coceira, ardência ou aperto',
      'Beba água antes e depois da sessão',
    ],
  },
  {
    id: 2,
    title: 'Acoplamento',
    tagline: 'Integrar ar e som',
    description:
      'Combine o fluxo de ar com a fonação usando sons de trato semiocluído (humming, "ng", canudo), com transições suaves entre os sons.',
    goals: [
      'Conectar respiração e emissão sem quebras',
      'Sentir vibração leve na face, sem pressão na laringe',
      'Fazer transições suaves entre sons e notas',
    ],
    rules: [
      'Só avance se as últimas sessões da Fase 1 foram sem tensão',
      'Mantenha o esforço constante e baixo, sem forçar agudos',
      'Mudanças de nota devem ser pequenas e graduais',
    ],
  },
  {
    id: 3,
    title: 'Resistência',
    tagline: 'Duração com conforto',
    description:
      'Aumente gradualmente a duração e a continuidade dos exercícios mantendo o mesmo conforto, respeitando os intervalos de descanso vocal absoluto.',
    goals: [
      'Sustentar a prática por mais tempo sem fadiga',
      'Manter a mesma qualidade do início ao fim do bloco',
      'Recuperar-se bem durante o descanso',
    ],
    rules: [
      'Aumente a carga em pequenos passos, nunca em saltos',
      'Se houver cansaço vocal, volte à fase anterior',
      'Descanso vocal absoluto: sem falar, sem sussurrar',
    ],
  },
];

export type TagSeverity = 'ok' | 'warning' | 'alert';

export interface SensationTag {
  id: string;
  label: string;
  severity: TagSeverity;
}

export const SENSATION_TAGS: readonly SensationTag[] = [
  { id: 'no-tension', label: '✅ Sem tensão', severity: 'ok' },
  { id: 'light-itch', label: '⚠️ Leve coceira na garganta', severity: 'warning' },
  { id: 'dry-throat', label: '⚠️ Garganta seca', severity: 'warning' },
  {
    id: 'neck-tension',
    label: '⚠️ Tensão no pescoço ou mandíbula',
    severity: 'warning',
  },
  { id: 'fatigue', label: '⚠️ Cansaço vocal', severity: 'warning' },
  { id: 'hoarseness', label: '🛑 Rouquidão', severity: 'alert' },
  { id: 'pain', label: '🛑 Dor ao falar ou engolir', severity: 'alert' },
  { id: 'voice-loss', label: '🛑 Falhas ou perda de voz', severity: 'alert' },
];

export const SAFETY_ALERTS = {
  general:
    'Este app é educativo e não substitui a avaliação de um fonoaudiólogo ou otorrinolaringologista. Em caso de dor, rouquidão persistente ou perda de voz, interrompa o treino e procure um profissional.',
  warning:
    'Você registrou um sinal de alerta leve. Reduza a intensidade, hidrate-se e considere repetir a fase anterior ou descansar até o próximo dia.',
  alert:
    'Você registrou um sintoma que exige cuidado. Interrompa o treino vocal por hoje e procure um profissional se persistir por mais de alguns dias.',
  rest: 'Descanso vocal absoluto: não fale nem sussurre. Respire com calma e beba água.',
} as const;

export const BIOMECHANICS_RULES: readonly string[] = [
  'Conforto vem antes de desempenho: sem dor, sem ardência, sem aperto.',
  'Progrida somente quando as sessões anteriores forem registradas como "sem tensão".',
  'Respeite sempre o descanso vocal absoluto entre os blocos.',
];

export interface TimerSettings {
  practiceSeconds: number;
  restSeconds: number;
  cycles: number;
  soundEnabled: boolean;
}

export const TIMER_DEFAULTS: TimerSettings = {
  practiceSeconds: 180,
  restSeconds: 60,
  cycles: 3,
  soundEnabled: true,
};

export const TIMER_OPTIONS = {
  practiceSeconds: [60, 120, 180, 240, 300],
  restSeconds: [30, 60, 90, 120],
  cycles: [1, 2, 3, 4, 5, 6],
} as const;

export const STORAGE_KEYS = {
  store: 'vbt:store:v1',
  safetyAck: 'vbt:safety-ack:v1',
} as const;

export const MAX_NOTE_LENGTH = 500;

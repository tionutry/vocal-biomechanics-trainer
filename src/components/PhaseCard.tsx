import type { Phase, PhaseId } from '../utils/constants';

interface PhaseCardProps {
  phase: Phase;
  sessionsLogged: number;
  isLastUsed: boolean;
  onStart: (id: PhaseId) => void;
}

export function PhaseCard({ phase, sessionsLogged, isLastUsed, onStart }: PhaseCardProps) {
  const headingId = `phase-title-${phase.id}`;

  return (
    <article
      aria-labelledby={headingId}
      className="rounded-2xl border border-ink-600 bg-ink-800 p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-sage-400">
            Fase {phase.id}
          </p>
          <h3 id={headingId} className="mt-1 text-lg font-semibold text-mist-100">
            {phase.title}
          </h3>
          <p className="text-sm text-mist-300">{phase.tagline}</p>
        </div>
        {isLastUsed && (
          <span className="rounded-full border border-sage-600 px-3 py-1 text-xs text-sage-300">
            Última praticada
          </span>
        )}
      </div>

      <p className="mt-4 leading-relaxed text-mist-300">{phase.description}</p>

      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-mist-300">
        {phase.goals.map((goal) => (
          <li key={goal}>{goal}</li>
        ))}
      </ul>

      <details className="mt-4 text-sm text-mist-300">
        <summary className="cursor-pointer text-mist-100">Regras desta fase</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {phase.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </details>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-xs text-mist-500">
          {sessionsLogged === 0
            ? 'Nenhuma sessão registrada'
            : `${sessionsLogged} ${sessionsLogged === 1 ? 'sessão registrada' : 'sessões registradas'}`}
        </p>
        <button
          type="button"
          onClick={() => onStart(phase.id)}
          aria-label={`Iniciar sessão da fase ${phase.id}: ${phase.title}`}
          className="rounded-xl bg-sage-400 px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-sage-300"
        >
          Iniciar Sessão da Fase
        </button>
      </div>
    </article>
  );
}

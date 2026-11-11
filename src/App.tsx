import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Layout } from './components/Layout';
import { PhaseCard } from './components/PhaseCard';
import { SessionTimer } from './components/SessionTimer';
import { DailyLogForm } from './components/DailyLogForm';
import type { DailyLogInput } from './components/DailyLogForm';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useVocalStore } from './store/useVocalStore';
import {
  BIOMECHANICS_RULES,
  PHASES,
  SAFETY_ALERTS,
  SENSATION_TAGS,
  STORAGE_KEYS,
  TIMER_OPTIONS,
} from './utils/constants';
import type { PhaseId, TimerSettings } from './utils/constants';

type View = 'dashboard' | 'session' | 'log';

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function tagLabel(id: string): string {
  return SENSATION_TAGS.find((t) => t.id === id)?.label ?? id;
}

function SettingsPanel() {
  const settings = useVocalStore((s) => s.settings);
  const updateSettings = useVocalStore((s) => s.updateSettings);

  const onNumber =
    (key: 'practiceSeconds' | 'restSeconds' | 'cycles') =>
    (event: ChangeEvent<HTMLSelectElement>): void => {
      const value = Number(event.target.value);
      if (Number.isFinite(value)) updateSettings({ [key]: value } as Partial<TimerSettings>);
    };

  const selectClass =
    'mt-1 w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm text-mist-100';

  return (
    <details className="rounded-2xl border border-ink-600 bg-ink-800 p-6">
      <summary className="cursor-pointer text-base font-semibold text-mist-100">
        Configurações do timer
      </summary>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="text-sm text-mist-300">
          Prática
          <select
            className={selectClass}
            value={settings.practiceSeconds}
            onChange={onNumber('practiceSeconds')}
          >
            {TIMER_OPTIONS.practiceSeconds.map((s) => (
              <option key={s} value={s}>
                {s / 60} min
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-mist-300">
          Descanso
          <select
            className={selectClass}
            value={settings.restSeconds}
            onChange={onNumber('restSeconds')}
          >
            {TIMER_OPTIONS.restSeconds.map((s) => (
              <option key={s} value={s}>
                {s < 60 ? `${s} s` : `${s / 60} min`}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-mist-300">
          Ciclos
          <select className={selectClass} value={settings.cycles} onChange={onNumber('cycles')}>
            {TIMER_OPTIONS.cycles.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-5 flex items-center gap-3 text-sm text-mist-300">
        <input
          type="checkbox"
          checked={settings.soundEnabled}
          onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
          className="h-4 w-4 accent-sage-400"
        />
        Beep suave ao trocar de etapa
      </label>
    </details>
  );
}

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [safetyAck, setSafetyAck, ackError] = useLocalStorage<boolean>(
    STORAGE_KEYS.safetyAck,
    false,
  );

  const currentPhase = useVocalStore((s) => s.currentPhase);
  const logs = useVocalStore((s) => s.logs);
  const settings = useVocalStore((s) => s.settings);
  const selectPhase = useVocalStore((s) => s.selectPhase);
  const addLog = useVocalStore((s) => s.addLog);
  const clearLogs = useVocalStore((s) => s.clearLogs);

  const activePhase = useMemo(
    () => PHASES.find((p) => p.id === currentPhase) ?? null,
    [currentPhase],
  );

  const countsByPhase = useMemo(() => {
    const counts: Record<PhaseId, number> = { 1: 0, 2: 0, 3: 0 };
    for (const log of logs) counts[log.phase] += 1;
    return counts;
  }, [logs]);

  const goHome = (): void => setView('dashboard');

  const startSession = (id: PhaseId): void => {
    selectPhase(id);
    setView('session');
  };

  const handleSubmitLog = (input: DailyLogInput): void => {
    addLog(input);
    setView('dashboard');
  };

  const handleClear = (): void => {
    if (window.confirm('Apagar todo o histórico de registros deste dispositivo?')) {
      clearLogs();
    }
  };

  const showSession = view === 'session' && activePhase !== null;
  const showLog = view === 'log' && activePhase !== null;

  return (
    <Layout onGoHome={showSession || showLog ? goHome : undefined}>
      {showSession && activePhase && (
        <SessionTimer
          key={activePhase.id}
          phase={activePhase}
          practiceSeconds={settings.practiceSeconds}
          restSeconds={settings.restSeconds}
          cycles={settings.cycles}
          soundEnabled={settings.soundEnabled}
          onFinish={() => setView('log')}
          onCancel={goHome}
        />
      )}

      {showLog && activePhase && (
        <DailyLogForm phase={activePhase} onSubmit={handleSubmitLog} onSkip={goHome} />
      )}

      {!showSession && !showLog && (
        <div className="space-y-10">
          {!safetyAck && (
            <section
              aria-labelledby="safety-title"
              className="rounded-2xl border border-amber-400 bg-amber-900 p-6"
            >
              <h2 id="safety-title" className="text-base font-semibold text-mist-100">
                Antes de começar
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-mist-100">
                {SAFETY_ALERTS.general}
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-mist-100">
                {BIOMECHANICS_RULES.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setSafetyAck(true)}
                className="mt-4 rounded-xl bg-sage-400 px-5 py-2 text-sm font-semibold text-ink-900 hover:bg-sage-300"
              >
                Entendi
              </button>
              {ackError && <p className="mt-2 text-xs text-rose-400">{ackError}</p>}
            </section>
          )}

          <section aria-labelledby="phases-title" className="space-y-5">
            <h2 id="phases-title" className="text-lg font-semibold text-mist-100">
              Protocolo em 3 fases
            </h2>
            {PHASES.map((phase) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                sessionsLogged={countsByPhase[phase.id]}
                isLastUsed={currentPhase === phase.id}
                onStart={startSession}
              />
            ))}
          </section>

          <SettingsPanel />

          <section aria-labelledby="history-title">
            <div className="flex items-center justify-between gap-4">
              <h2 id="history-title" className="text-lg font-semibold text-mist-100">
                Diário de bordo
              </h2>
              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Limpar histórico de registros"
                  className="text-sm text-mist-500 underline underline-offset-4 hover:text-mist-300"
                >
                  Limpar histórico
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <p className="mt-3 text-sm text-mist-500">
                Os registros das suas sessões aparecerão aqui.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {logs.slice(0, 10).map((log) => (
                  <li
                    key={log.id}
                    className="rounded-xl border border-ink-600 bg-ink-800 p-4 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3 text-xs text-mist-500">
                      <span>Fase {log.phase}</span>
                      <time dateTime={log.timestamp}>{formatDateTime(log.timestamp)}</time>
                    </div>
                    {log.tags.length > 0 && (
                      <p className="mt-2 text-mist-100">
                        {log.tags.map(tagLabel).join(' · ')}
                      </p>
                    )}
                    {log.note && (
                      <p className="mt-2 whitespace-pre-wrap text-mist-300">{log.note}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Layout>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import type { Phase } from '../utils/constants';
import { SAFETY_ALERTS } from '../utils/constants';

type Mode = 'practice' | 'rest';

interface SessionTimerProps {
  phase: Phase;
  practiceSeconds: number;
  restSeconds: number;
  cycles: number;
  soundEnabled: boolean;
  onFinish: () => void;
  onCancel: () => void;
}

function formatTime(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

type AudioCtor = typeof AudioContext;

function getAudioContext(ref: MutableRefObject<AudioContext | null>): AudioContext | null {
  try {
    if (!ref.current) {
      const Ctor: AudioCtor | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
      if (!Ctor) return null;
      ref.current = new Ctor();
    }
    if (ref.current.state === 'suspended') void ref.current.resume();
    return ref.current;
  } catch {
    return null;
  }
}

/** Tom senoidal com envelope suave para evitar cliques e sustos. */
function playTone(ctx: AudioContext, frequency: number, duration: number, delay = 0): void {
  const start = ctx.currentTime + delay;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.12, start + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

export function SessionTimer({
  phase,
  practiceSeconds,
  restSeconds,
  cycles,
  soundEnabled,
  onFinish,
  onCancel,
}: SessionTimerProps) {
  const practiceMs = practiceSeconds * 1000;
  const restMs = restSeconds * 1000;

  const [mode, setMode] = useState<Mode>('practice');
  const [cycle, setCycle] = useState(1);
  const [remainingMs, setRemainingMs] = useState(practiceMs);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  /** Instante absoluto de término do segmento atual; evita deriva do setInterval. */
  const endRef = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const beep = useCallback(
    (kind: 'toRest' | 'toPractice' | 'finish') => {
      if (!soundEnabled) return;
      const ctx = getAudioContext(audioRef);
      if (!ctx) return;
      if (kind === 'toRest') playTone(ctx, 440, 0.6);
      if (kind === 'toPractice') playTone(ctx, 660, 0.6);
      if (kind === 'finish') {
        playTone(ctx, 660, 0.5);
        playTone(ctx, 440, 0.8, 0.6);
      }
    },
    [soundEnabled],
  );

  /** Troca de segmento: prática → descanso → prática, encerrando após o último ciclo de prática. */
  const advance = useCallback(() => {
    if (mode === 'practice') {
      if (cycle >= cycles) {
        endRef.current = null;
        setRemainingMs(0);
        setRunning(false);
        setFinished(true);
        beep('finish');
        return;
      }
      endRef.current = Date.now() + restMs;
      setMode('rest');
      setRemainingMs(restMs);
      beep('toRest');
    } else {
      endRef.current = Date.now() + practiceMs;
      setMode('practice');
      setCycle((c) => c + 1);
      setRemainingMs(practiceMs);
      beep('toPractice');
    }
  }, [mode, cycle, cycles, restMs, practiceMs, beep]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      if (endRef.current === null) return;
      const left = Math.max(0, endRef.current - Date.now());
      setRemainingMs(left);
      if (left === 0) advance();
    }, 200);
    return () => window.clearInterval(id);
  }, [running, advance]);

  // Mantém a tela acesa durante a sessão, quando o navegador permite.
  useEffect(() => {
    if (!running || !('wakeLock' in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;
    navigator.wakeLock
      .request('screen')
      .then((s) => {
        if (cancelled) void s.release();
        else sentinel = s;
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      void sentinel?.release();
    };
  }, [running]);

  useEffect(() => {
    return () => {
      void audioRef.current?.close();
    };
  }, []);

  const toggle = (): void => {
    if (finished) return;
    if (running) {
      if (endRef.current !== null) {
        setRemainingMs(Math.max(0, endRef.current - Date.now()));
      }
      setRunning(false);
    } else {
      getAudioContext(audioRef); // desbloqueia o áudio dentro do gesto do usuário
      endRef.current = Date.now() + remainingMs;
      setRunning(true);
    }
  };

  const reset = (): void => {
    endRef.current = null;
    setRunning(false);
    setFinished(false);
    setMode('practice');
    setCycle(1);
    setRemainingMs(practiceMs);
  };

  const segmentMs = mode === 'practice' ? practiceMs : restMs;
  const progress = finished ? 100 : Math.round((1 - remainingMs / segmentMs) * 100);
  const isPractice = mode === 'practice';
  const modeLabel = finished
    ? 'Sessão concluída'
    : isPractice
      ? 'Prática'
      : 'Descanso Vocal Absoluto';

  return (
    <section
      aria-label={`Sessão da fase ${phase.id}: ${phase.title}`}
      className={`rounded-3xl border p-8 text-center transition-colors duration-700 ${
        finished
          ? 'border-ink-600 bg-ink-800'
          : isPractice
            ? 'border-sage-600 bg-practice'
            : 'border-mist-500 bg-rest'
      }`}
    >
      <p className="text-xs uppercase tracking-widest text-mist-300">
        Fase {phase.id} · {phase.title}
      </p>

      <h2 className="mt-3 text-2xl font-semibold text-mist-100" aria-live="polite">
        {modeLabel}
      </h2>

      <p
        role="timer"
        aria-label={`Tempo restante ${formatTime(remainingMs)}`}
        className="my-6 font-mono text-7xl font-light tabular-nums text-mist-100"
      >
        {formatTime(remainingMs)}
      </p>

      <div
        role="progressbar"
        aria-label="Progresso do segmento atual"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="mx-auto h-2 w-full max-w-sm overflow-hidden rounded-full bg-ink-700"
      >
        <div
          className="h-full bg-sage-400 transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-4 text-sm text-mist-300">
        Ciclo {cycle} de {cycles}
      </p>

      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-mist-300">
        {finished
          ? 'Bom trabalho. Registre agora como você se sentiu.'
          : isPractice
            ? (phase.goals[0] ?? '')
            : SAFETY_ALERTS.rest}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {finished ? (
          <button
            type="button"
            onClick={onFinish}
            className="rounded-xl bg-sage-400 px-6 py-3 font-semibold text-ink-900 hover:bg-sage-300"
          >
            Registrar sensações
          </button>
        ) : (
          <button
            type="button"
            onClick={toggle}
            aria-label={running ? 'Pausar timer' : 'Iniciar timer'}
            className="rounded-xl bg-sage-400 px-6 py-3 font-semibold text-ink-900 hover:bg-sage-300"
          >
            {running ? 'Pausar' : remainingMs === segmentMs && cycle === 1 && isPractice ? 'Iniciar' : 'Continuar'}
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          aria-label="Reiniciar sessão"
          className="rounded-xl border border-ink-600 px-5 py-3 text-mist-100 hover:bg-ink-700"
        >
          Reiniciar
        </button>
      </div>

      {!finished && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          <button
            type="button"
            onClick={onFinish}
            aria-label="Encerrar sessão e registrar sensações"
            className="text-sage-300 underline underline-offset-4 hover:text-sage-400"
          >
            Encerrar e registrar
          </button>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancelar sessão sem registrar"
            className="text-mist-500 underline underline-offset-4 hover:text-mist-300"
          >
            Cancelar
          </button>
        </div>
      )}
    </section>
  );
}

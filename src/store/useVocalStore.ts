import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '../hooks/useLocalStorage';
import {
  STORAGE_KEYS,
  TIMER_DEFAULTS,
  TIMER_OPTIONS,
  MAX_NOTE_LENGTH,
} from '../utils/constants';
import type { PhaseId, TimerSettings } from '../utils/constants';

export interface LogEntry {
  id: string;
  timestamp: string;
  phase: PhaseId;
  tags: string[];
  note: string;
}

export type NewLogEntry = Omit<LogEntry, 'id' | 'timestamp'>;

interface VocalState {
  currentPhase: PhaseId | null;
  logs: LogEntry[];
  settings: TimerSettings;
  selectPhase: (phase: PhaseId | null) => void;
  addLog: (entry: NewLogEntry) => void;
  clearLogs: () => void;
  updateSettings: (partial: Partial<TimerSettings>) => void;
}

type PersistedState = Pick<VocalState, 'currentPhase' | 'logs' | 'settings'>;

function createId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // contexto inseguro: usa o fallback abaixo
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function pickAllowed(value: unknown, allowed: readonly number[], fallback: number): number {
  return typeof value === 'number' && allowed.includes(value) ? value : fallback;
}

/** Garante que configurações vindas do storage ou da UI estejam dentro dos valores permitidos. */
function sanitizeSettings(input: Partial<TimerSettings>): TimerSettings {
  return {
    practiceSeconds: pickAllowed(
      input.practiceSeconds,
      TIMER_OPTIONS.practiceSeconds,
      TIMER_DEFAULTS.practiceSeconds,
    ),
    restSeconds: pickAllowed(
      input.restSeconds,
      TIMER_OPTIONS.restSeconds,
      TIMER_DEFAULTS.restSeconds,
    ),
    cycles: pickAllowed(input.cycles, TIMER_OPTIONS.cycles, TIMER_DEFAULTS.cycles),
    soundEnabled:
      typeof input.soundEnabled === 'boolean'
        ? input.soundEnabled
        : TIMER_DEFAULTS.soundEnabled,
  };
}

function isPhaseId(value: unknown): value is PhaseId {
  return value === 1 || value === 2 || value === 3;
}

function isLogEntry(value: unknown): value is LogEntry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.timestamp === 'string' &&
    isPhaseId(v.phase) &&
    Array.isArray(v.tags) &&
    v.tags.every((t) => typeof t === 'string') &&
    typeof v.note === 'string'
  );
}

export const useVocalStore = create<VocalState>()(
  persist(
    (set) => ({
      currentPhase: null,
      logs: [],
      settings: TIMER_DEFAULTS,
      selectPhase: (phase) => set({ currentPhase: phase }),
      addLog: (entry) =>
        set((state) => ({
          logs: [
            {
              id: createId(),
              timestamp: new Date().toISOString(),
              phase: entry.phase,
              tags: [...entry.tags],
              note: entry.note.trim().slice(0, MAX_NOTE_LENGTH),
            },
            ...state.logs,
          ],
        })),
      clearLogs: () => set({ logs: [] }),
      updateSettings: (partial) =>
        set((state) => ({ settings: sanitizeSettings({ ...state.settings, ...partial }) })),
    }),
    {
      name: STORAGE_KEYS.store,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state): PersistedState => ({
        currentPhase: state.currentPhase,
        logs: state.logs,
        settings: state.settings,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PersistedState>;
        return {
          ...current,
          currentPhase: isPhaseId(p.currentPhase) ? p.currentPhase : null,
          logs: Array.isArray(p.logs) ? p.logs.filter(isLogEntry) : [],
          settings: sanitizeSettings(p.settings ?? {}),
        };
      },
    },
  ),
);

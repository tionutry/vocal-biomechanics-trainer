import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  MAX_NOTE_LENGTH,
  SAFETY_ALERTS,
  SENSATION_TAGS,
} from '../utils/constants';
import type { Phase, PhaseId } from '../utils/constants';

export interface DailyLogInput {
  phase: PhaseId;
  tags: string[];
  note: string;
}

interface DailyLogFormProps {
  phase: Phase;
  onSubmit: (input: DailyLogInput) => void;
  onSkip: () => void;
}

export function DailyLogForm({ phase, onSubmit, onSkip }: DailyLogFormProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const severityOf = (id: string): string | undefined =>
    SENSATION_TAGS.find((t) => t.id === id)?.severity;

  /** "Sem tensão" é exclusivo: não pode coexistir com sintomas. */
  const toggleTag = (id: string): void => {
    setError(null);
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((t) => t !== id);
      const isOk = severityOf(id) === 'ok';
      const kept = prev.filter((t) => (severityOf(t) === 'ok') === isOk);
      return [...kept, id];
    });
  };

  const hasAlert = selected.some((id) => severityOf(id) === 'alert');
  const hasWarning = selected.some((id) => severityOf(id) === 'warning');

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = note.trim();

    if (selected.length === 0 && trimmed.length === 0) {
      setError('Selecione ao menos uma sensação ou escreva uma observação.');
      return;
    }
    if (trimmed.length > MAX_NOTE_LENGTH) {
      setError(`A observação deve ter no máximo ${MAX_NOTE_LENGTH} caracteres.`);
      return;
    }

    try {
      onSubmit({ phase: phase.id, tags: selected, note: trimmed });
    } catch (err) {
      console.error('[log] Falha ao salvar registro', err);
      setError('Não foi possível salvar o registro. Tente novamente.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Diário de bordo da sessão"
      className="rounded-2xl border border-ink-600 bg-ink-800 p-6"
    >
      <h2 className="text-xl font-semibold text-mist-100">Como você se sentiu?</h2>
      <p className="mt-1 text-sm text-mist-300">
        Registro da Fase {phase.id} · {phase.title}
      </p>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-mist-100">Sensações físicas</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SENSATION_TAGS.map((tag) => {
            const checked = selected.includes(tag.id);
            const inputId = `tag-${tag.id}`;
            return (
              <label
                key={tag.id}
                htmlFor={inputId}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                  checked
                    ? 'border-sage-400 bg-ink-700 text-mist-100'
                    : 'border-ink-600 text-mist-300 hover:bg-ink-700'
                }`}
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTag(tag.id)}
                  className="h-4 w-4 accent-sage-400"
                />
                <span>{tag.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {(hasAlert || hasWarning) && (
        <p
          role="alert"
          className={`mt-4 rounded-xl border px-4 py-3 text-sm leading-relaxed ${
            hasAlert
              ? 'border-rose-400 bg-rose-900 text-mist-100'
              : 'border-amber-400 bg-amber-900 text-mist-100'
          }`}
        >
          {hasAlert ? SAFETY_ALERTS.alert : SAFETY_ALERTS.warning}
        </p>
      )}

      <div className="mt-6">
        <label htmlFor="log-note" className="text-sm font-medium text-mist-100">
          Observações (opcional)
        </label>
        <textarea
          id="log-note"
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setError(null);
          }}
          maxLength={MAX_NOTE_LENGTH}
          rows={4}
          className="mt-2 w-full rounded-xl border border-ink-600 bg-ink-900 p-3 text-sm text-mist-100 placeholder:text-mist-500"
          placeholder="Ex.: mandíbula solta, ar fluindo bem…"
        />
        <p className="mt-1 text-right text-xs text-mist-500">
          {note.length}/{MAX_NOTE_LENGTH}
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-rose-400">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={onSkip}
          aria-label="Pular o registro e voltar ao painel"
          className="rounded-xl border border-ink-600 px-5 py-3 text-sm text-mist-300 hover:bg-ink-700"
        >
          Pular
        </button>
        <button
          type="submit"
          className="rounded-xl bg-sage-400 px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-sage-300"
        >
          Salvar registro
        </button>
      </div>
    </form>
  );
}

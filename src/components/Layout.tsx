import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { SAFETY_ALERTS } from '../utils/constants';

interface LayoutProps {
  children: ReactNode;
  onGoHome?: () => void;
}

function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const on = (): void => setOnline(true);
    const off = (): void => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return online;
}

export function Layout({ children, onGoHome }: LayoutProps) {
  const online = useOnlineStatus();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-ink-600 bg-ink-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-mist-100">
              Vocal Biomechanics Trainer
            </h1>
            <p className="mt-1 text-sm text-mist-300">
              Treino vocal guiado, com calma e segurança
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs ${
                online
                  ? 'border-sage-600 text-sage-300'
                  : 'border-amber-400 text-amber-400'
              }`}
              role="status"
            >
              {online ? 'Online' : 'Offline'}
            </span>
            {onGoHome && (
              <button
                type="button"
                onClick={onGoHome}
                aria-label="Voltar ao painel de fases"
                className="rounded-lg border border-ink-600 px-3 py-2 text-sm text-mist-100 hover:bg-ink-700"
              >
                Painel
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>

      <footer className="border-t border-ink-600 bg-ink-800">
        <p className="mx-auto max-w-3xl px-6 py-5 text-xs leading-relaxed text-mist-500">
          {SAFETY_ALERTS.general}
        </p>
      </footer>
    </div>
  );
}

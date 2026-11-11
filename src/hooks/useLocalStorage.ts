import { useCallback, useEffect, useRef, useState } from 'react';
import type { StateStorage } from 'zustand/middleware';

/**
 * Adaptador de storage para o Zustand. Nunca lança exceções: leitura inválida
 * (JSON corrompido) devolve null e falhas de escrita (cota cheia, modo privado)
 * são apenas registradas no console.
 */
export const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      const raw = window.localStorage.getItem(name);
      if (raw === null) return null;
      JSON.parse(raw);
      return raw;
    } catch (err) {
      console.error(`[storage] Leitura inválida de "${name}"`, err);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch (err) {
      console.error(`[storage] Falha ao salvar "${name}"`, err);
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch (err) {
      console.error(`[storage] Falha ao remover "${name}"`, err);
    }
  },
};

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

/**
 * Estado React sincronizado com localStorage, inclusive entre abas
 * (evento "storage"). Retorna [valor, setValue, erro].
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): readonly [T, SetValue<T>, string | null] {
  const initialRef = useRef<T>(initialValue);

  const readValue = useCallback((): T => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initialRef.current : (JSON.parse(raw) as T);
    } catch {
      return initialRef.current;
    }
  }, [key]);

  const [value, setStored] = useState<T>(readValue);
  const [error, setError] = useState<string | null>(null);
  const valueRef = useRef<T>(value);

  const setValue = useCallback<SetValue<T>>(
    (update) => {
      const next =
        typeof update === 'function'
          ? (update as (prev: T) => T)(valueRef.current)
          : (update as T);
      valueRef.current = next;
      setStored(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
        setError(null);
      } catch {
        setError('Não foi possível salvar neste dispositivo.');
      }
    },
    [key],
  );

  useEffect(() => {
    const onStorage = (event: StorageEvent): void => {
      if (event.storageArea !== window.localStorage || event.key !== key) return;
      const next = readValue();
      valueRef.current = next;
      setStored(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, readValue]);

  return [value, setValue, error] as const;
}

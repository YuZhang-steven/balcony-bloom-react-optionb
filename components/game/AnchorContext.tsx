import { createContext, useContext, useRef, useCallback, useEffect, type ReactNode } from 'react';
import type { Anchor } from '../../types';

type Listener = () => void;

interface AnchorContextValue {
  registerAnchor: (anchor: Anchor) => void;
  clearAnchors: () => void;
  nearest: (x: number, y: number, maxDist?: number) => Anchor | null;
  all: () => Anchor[];
  subscribe: (cb: Listener) => () => void;
}

const AnchorCtx = createContext<AnchorContextValue | null>(null);

export function AnchorProvider({ children }: { children: ReactNode }) {
  const store = useRef<Anchor[]>([]);
  const listeners = useRef<Set<Listener>>(new Set());

  const notify = useCallback(() => listeners.current.forEach(l => l()), []);

  const registerAnchor = useCallback((a: Anchor) => {
    store.current.push(a);
    notify();
  }, [notify]);

  const clearAnchors = useCallback(() => {
    store.current = [];
    notify();
  }, [notify]);

  const nearest = useCallback((x: number, y: number, maxDist = 120): Anchor | null => {
    let best: Anchor | null = null;
    let bd = maxDist * maxDist;
    for (const a of store.current) {
      const d = (a.x - x) ** 2 + (a.y - y) ** 2;
      if (d < bd) { bd = d; best = a; }
    }
    return best;
  }, []);

  const all = useCallback((): Anchor[] => [...store.current], []);

  const subscribe = useCallback((cb: Listener) => {
    listeners.current.add(cb);
    return () => listeners.current.delete(cb);
  }, []);

  return (
    <AnchorCtx.Provider value={{ registerAnchor, clearAnchors, nearest, all, subscribe }}>
      {children}
    </AnchorCtx.Provider>
  );
}

export function useAnchors(): AnchorContextValue {
  const ctx = useContext(AnchorCtx);
  if (!ctx) {
    throw new Error('useAnchors must be used within an AnchorProvider');
  }
  return ctx;
}

export function useRegisterAnchors(list: Anchor[]): void {
  const { registerAnchor } = useAnchors();
  const done = useRef(false);

  useEffect(() => {
    if (!done.current) {
      list.forEach(registerAnchor);
      done.current = true;
    }
  }, [registerAnchor, list]);
}

export type { Anchor };

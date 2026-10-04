import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Check, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../lib/cn';

type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
  detail?: string;
}

interface ToastContextValue {
  toast: (message: string, opts?: { tone?: ToastTone; detail?: string }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const ICONS = { success: Check, error: AlertTriangle, info: Info } as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue['toast']>(
    (message, opts) => {
      const id = nextId.current++;
      const entry: Toast = {
        id,
        message,
        tone: opts?.tone ?? 'success',
        detail: opts?.detail,
      };
      // Cap the stack so rapid actions never bury the page (§58).
      setToasts((list) => [...list.slice(-2), entry]);
      window.setTimeout(() => dismiss(id), entry.tone === 'error' ? 6000 : 3800);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Polite live region: announced by screen readers, never focus-stealing */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-toast flex flex-col items-center gap-2 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:items-end sm:px-6"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.tone];
          return (
            <div
              key={t.id}
              className={cn(
                'liquid-glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl px-4 py-3',
                'animate-[toast-in_280ms_cubic-bezier(0.22,1,0.36,1)_both]',
              )}
            >
              <span
                className={cn(
                  'relative z-[2] mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full',
                  t.tone === 'success' && 'bg-bone text-ink-900',
                  t.tone === 'error' && 'bg-accent text-white',
                  t.tone === 'info' && 'bg-ink-500 text-bone',
                )}
              >
                <Icon size={12} strokeWidth={2.5} />
              </span>
              <div className="relative z-[2] min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug text-bone">
                  {t.message}
                </p>
                {t.detail && (
                  <p className="mt-0.5 truncate text-xs text-bone-dim">{t.detail}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="relative z-[2] -mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-bone-dim transition-colors hover:text-bone"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

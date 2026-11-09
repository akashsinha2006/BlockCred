import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((type, message) => {
    const id = Math.random().toString(36).slice(2);
    setItems((l) => [...l, { id, type, message }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 4500);
  }, []);
  const api = useMemo(() => ({
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  }), [push]);
  const Icon = { success: CheckCircle2, error: XCircle, info: Info };
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => { const I = Icon[t.type]; return <div key={t.id} className={`toast ${t.type}`}><I size={18} /> {t.message}</div>; })}
      </div>
    </ToastCtx.Provider>
  );
}

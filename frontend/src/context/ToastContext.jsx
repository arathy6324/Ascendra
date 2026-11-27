import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success", title = "") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const toast = {
    success: (msg, title = "Success") => showToast(msg, "success", title),
    error: (msg, title = "Action Failed") => showToast(msg, "error", title),
    info: (msg, title = "Notice") => showToast(msg, "info", title),
  };

  const styles = {
    success: {
      wrap: "bg-white border-emerald-200 shadow-emerald-500/10",
      iconWrap: "bg-emerald-50 text-emerald-600 border-emerald-200",
      Icon: CheckCircle2,
      bar: "bg-emerald-500",
    },
    error: {
      wrap: "bg-white border-rose-200 shadow-rose-500/10",
      iconWrap: "bg-rose-50 text-rose-600 border-rose-200",
      Icon: AlertCircle,
      bar: "bg-rose-500",
    },
    info: {
      wrap: "bg-white border-indigo-200 shadow-indigo-500/10",
      iconWrap: "bg-indigo-50 text-indigo-600 border-indigo-200",
      Icon: Info,
      bar: "bg-indigo-500",
    },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const cfg = styles[t.type] || styles.info;
          const Icon = cfg.Icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-xl transition-all flex items-start gap-3 ${cfg.wrap}`}
            >
              <span className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar}`} />
              <div className={`p-1.5 rounded-xl border shrink-0 ${cfg.iconWrap}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                {t.title && <p className="text-xs font-bold text-slate-900">{t.title}</p>}
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return ctx;
};

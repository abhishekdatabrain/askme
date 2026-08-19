'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', title = null) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type, title };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const toast = {
    success: (msg, title = 'Success') => showToast(msg, 'success', title),
    error: (msg, title = 'Error') => showToast(msg, 'error', title),
    info: (msg, title = 'Notification') => showToast(msg, 'info', title),
    warning: (msg, title = 'Warning') => showToast(msg, 'warning', title),
  };

  useEffect(() => {
    const handleGlobalToast = (e) => {
      if (e.detail) {
        showToast(e.detail.message, e.detail.type || 'info', e.detail.title);
      }
    };
    window.addEventListener('askme_toast', handleGlobalToast);
    return () => window.removeEventListener('askme_toast', handleGlobalToast);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none p-2 sm:p-0">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 animate-toast-in flex items-start gap-3 text-xs ${
                isSuccess
                  ? 'bg-[#0A1F18]/90 border-[#00E676]/40 text-[#F5F5F7] shadow-[#00E676]/10'
                  : isError
                  ? 'bg-[#2A0C14]/90 border-[#FF3D71]/40 text-[#F5F5F7] shadow-[#FF3D71]/10'
                  : isWarning
                  ? 'bg-[#2A2307]/90 border-[#FFD60A]/40 text-[#F5F5F7] shadow-[#FFD60A]/10'
                  : 'bg-[#13131A]/95 border-[#00F5D4]/40 text-[#F5F5F7] shadow-[#00F5D4]/10'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="h-5 w-5 text-[#00E676]" />}
                {isError && <AlertCircle className="h-5 w-5 text-[#FF3D71]" />}
                {isWarning && <AlertTriangle className="h-5 w-5 text-[#FFD60A]" />}
                {!isSuccess && !isError && !isWarning && (
                  <Info className="h-5 w-5 text-[#00F5D4]" />
                )}
              </div>

              <div className="flex-1 space-y-0.5 pr-1">
                {t.title && (
                  <h4
                    className={`font-bold font-heading text-sm ${
                      isSuccess
                        ? 'text-[#00E676]'
                        : isError
                        ? 'text-[#FF3D71]'
                        : isWarning
                        ? 'text-[#FFD60A]'
                        : 'text-[#00F5D4]'
                    }`}
                  >
                    {t.title}
                  </h4>
                )}
                <p className="text-[#F5F5F7] leading-relaxed font-medium">{t.message}</p>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-[#8B8B96] hover:text-white transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if component is rendered outside ToastProvider
    return {
      showToast: (msg, type, title) => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('askme_toast', { detail: { message: msg, type, title } })
          );
        }
      },
      toast: {
        success: (msg, title = 'Success') =>
          typeof window !== 'undefined' &&
          window.dispatchEvent(
            new CustomEvent('askme_toast', {
              detail: { message: msg, type: 'success', title },
            })
          ),
        error: (msg, title = 'Error') =>
          typeof window !== 'undefined' &&
          window.dispatchEvent(
            new CustomEvent('askme_toast', {
              detail: { message: msg, type: 'error', title },
            })
          ),
        info: (msg, title = 'Notification') =>
          typeof window !== 'undefined' &&
          window.dispatchEvent(
            new CustomEvent('askme_toast', {
              detail: { message: msg, type: 'info', title },
            })
          ),
        warning: (msg, title = 'Warning') =>
          typeof window !== 'undefined' &&
          window.dispatchEvent(
            new CustomEvent('askme_toast', {
              detail: { message: msg, type: 'warning', title },
            })
          ),
      },
    };
  }
  return context;
}

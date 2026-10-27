import React from 'react';
import { usePortal } from '../../context/PortalContext';
import {
  Server,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Clock,
  Zap,
} from 'lucide-react';

export const ServerTransactionToastContainer: React.FC = () => {
  const { transactionToasts, dismissTransactionToast, clearAllTransactionToasts } = usePortal();

  if (!transactionToasts || transactionToasts.length === 0) {
    return null;
  }

  return (
    <div
      id="server-transaction-toasts-container"
      className="fixed bottom-5 right-5 z-9999 max-w-sm sm:max-w-md w-full pointer-events-none space-y-2.5 px-3 sm:px-0"
    >
      {transactionToasts.length > 2 && (
        <div className="flex justify-end pointer-events-auto pb-1">
          <button
            onClick={clearAllTransactionToasts}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-700 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs transition"
          >
            Clear All ({transactionToasts.length})
          </button>
        </div>
      )}

      {transactionToasts.map((toast) => {
        const isProcessing = toast.status === 'processing';
        const isSuccess = toast.status === 'success';
        const isFailure = toast.status === 'failure';

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto rounded-2xl shadow-xl border p-4 transition-all duration-300 transform translate-y-0 backdrop-blur-md overflow-hidden ${
              isProcessing
                ? 'bg-slate-900/95 text-white border-blue-500/50 ring-2 ring-blue-500/20'
                : isSuccess
                ? 'bg-slate-900/95 text-white border-emerald-500/50 ring-2 ring-emerald-500/20'
                : 'bg-slate-900/95 text-white border-rose-500/50 ring-2 ring-rose-500/20'
            }`}
          >
            {/* Top Progress Line */}
            {isProcessing && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 animate-pulse w-full" />
              </div>
            )}
            {isSuccess && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
            )}
            {isFailure && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
            )}

            <div className="flex items-start space-x-3">
              {/* Icon Container */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isProcessing
                    ? 'bg-blue-500/20 text-blue-400'
                    : isSuccess
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
                {isSuccess && <CheckCircle2 className="w-5 h-5 animate-bounce-short" />}
                {isFailure && <AlertCircle className="w-5 h-5" />}
              </div>

              {/* Toast Body */}
              <div className="flex-1 min-w-0 pr-1">
                {/* Header row: Badge + Operation Tag */}
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 mb-1">
                  <span
                    className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isProcessing
                        ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                        : isSuccess
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/30'
                        : 'bg-rose-500/30 text-rose-300 border border-rose-400/30'
                    }`}
                  >
                    {isProcessing && (
                      <>
                        <Server className="w-2.5 h-2.5 animate-pulse" />
                        Server Processing
                      </>
                    )}
                    {isSuccess && (
                      <>
                        <Database className="w-2.5 h-2.5" />
                        Committed to DB
                      </>
                    )}
                    {isFailure && (
                      <>
                        <AlertCircle className="w-2.5 h-2.5" />
                        Transaction Failed
                      </>
                    )}
                  </span>

                  {toast.operationTag && (
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                      {toast.operationTag}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h4 className="text-xs font-bold text-white leading-tight">
                  {toast.title}
                </h4>

                {/* Message */}
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed break-words">
                  {toast.message}
                </p>

                {/* Error details if any */}
                {isFailure && toast.errorDetails && (
                  <div className="mt-2 p-2 bg-rose-950/60 border border-rose-800/50 rounded-lg text-[10px] text-rose-300 font-mono">
                    {toast.errorDetails}
                  </div>
                )}

                {/* Footer status metadata */}
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(toast.timestamp).toLocaleTimeString()}</span>
                    </span>
                    {toast.durationMs !== undefined && (
                      <span className="flex items-center space-x-1 text-emerald-400 font-mono">
                        <Zap className="w-2.5 h-2.5" />
                        <span>{toast.durationMs}ms</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                    ID: {toast.id.split('-').slice(-2).join('-')}
                  </span>
                </div>
              </div>

              {/* Close / Dismiss button */}
              <button
                type="button"
                onClick={() => dismissTransactionToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition shrink-0"
                title="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

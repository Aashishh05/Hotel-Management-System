import { X, LogOut } from "lucide-react";

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Log out",
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="fixed inset-0 bg-slate-900/60"
        onClick={busy ? undefined : onCancel}
      />

      <div
        className="relative w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-xl p-6 text-center"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          aria-label="Close"
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-60"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-500 flex items-center justify-center">
          <LogOut className="w-5 h-5" />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-1.5 text-sm text-slate-500">{message}</p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 py-2.5 transition-colors hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 rounded-lg bg-red-600 text-white text-sm font-semibold py-2.5 transition-colors hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {busy ? "Logging out…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
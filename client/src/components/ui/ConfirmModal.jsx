import { AlertTriangle, X } from "lucide-react";

function ConfirmModal({
  open,
  title = "Confirm action",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-5 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              danger
                ? "bg-rose-100 text-rose-600"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            <AlertTriangle size={24} />
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close confirmation dialog"
          >
            <X size={19} />
          </button>
        </div>

        <h2
          id="confirm-modal-title"
          className="mt-6 text-2xl font-black text-slate-950"
        >
          {title}
        </h2>

        <p className="mt-3 leading-7 text-slate-500">{message}</p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-5 py-3 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              danger
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmModal;
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  compact = false,
}) {
  const containerClass = compact
    ? "px-5 py-8"
    : "px-6 py-12";

  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center ${containerClass}`}
    >
      {Icon && (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
          <Icon size={28} />
        </div>
      )}

      <h3 className="mt-4 text-lg font-black text-slate-950">
        {title}
      </h3>

      {message && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {message}
        </p>
      )}

      {action && (
        <EmptyStateAction action={action} />
      )}
    </div>
  );
}

function EmptyStateAction({ action }) {
  const className =
    "mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700";

  if (action.onClick) {
    return (
      <button
        type="button"
        onClick={action.onClick}
        className={className}
      >
        {action.icon && (
          <action.icon size={18} />
        )}

        {action.label}

        {action.showArrow !== false && (
          <ChevronRight size={18} />
        )}
      </button>
    );
  }

  return (
    <Link
      to={action.to}
      className={className}
    >
      {action.icon && (
        <action.icon size={18} />
      )}

      {action.label}

      {action.showArrow !== false && (
        <ChevronRight size={18} />
      )}
    </Link>
  );
}

export default EmptyState;
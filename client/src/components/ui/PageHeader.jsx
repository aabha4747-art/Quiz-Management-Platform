import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

function PageHeader({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">
              {eyebrow}
            </p>
          )}

          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            {title}
          </h1>

          {description && (
            <p className="mt-3 max-w-2xl leading-7 text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {children}

          {(primaryAction || secondaryAction) && (
            <div className="flex flex-wrap gap-3">
              {secondaryAction && (
                <HeaderAction action={secondaryAction} />
              )}

              {primaryAction && (
                <HeaderAction
                  action={primaryAction}
                  primary
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function HeaderAction({
  action,
  primary = false,
}) {
  const className = primary
    ? "bg-indigo-600 text-white hover:bg-indigo-700"
    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50";

  if (action.onClick) {
    return (
      <button
        type="button"
        onClick={action.onClick}
        disabled={action.disabled}
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        {action.icon && (
          <action.icon size={18} />
        )}

        {action.label}

        {action.showArrow && (
          <ChevronRight size={18} />
        )}
      </button>
    );
  }

  return (
    <Link
      to={action.to}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold transition ${className}`}
    >
      {action.icon && (
        <action.icon size={18} />
      )}

      {action.label}

      {action.showArrow && (
        <ChevronRight size={18} />
      )}
    </Link>
  );
}

export default PageHeader;
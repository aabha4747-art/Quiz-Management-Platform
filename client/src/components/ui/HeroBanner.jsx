import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

function HeroBanner({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  icon: Icon,
  variant = "indigo",
  children,
}) {
  const variants = {
    indigo:
      "from-indigo-700 via-violet-700 to-blue-700",
    blue:
      "from-blue-700 via-indigo-700 to-cyan-600",
    emerald:
      "from-emerald-700 via-teal-700 to-cyan-700",
    dark:
      "from-slate-950 via-indigo-950 to-violet-900",
  };

  const gradient =
    variants[variant] || variants.indigo;

  return (
    <section
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${gradient} px-7 py-8 text-white shadow-lg sm:px-10`}
    >
      <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />

      <div className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="text-sm font-black uppercase tracking-[0.18em] text-white/80">
              {eyebrow}
            </p>
          )}

          <div className="mt-4 flex items-start gap-4">
            {Icon && (
              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur sm:flex">
                <Icon size={26} />
              </div>
            )}

            <div>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl">
                {title}
              </h1>

              {description && (
                <p className="mt-4 max-w-2xl leading-7 text-white/80">
                  {description}
                </p>
              )}
            </div>
          </div>

          {(primaryAction || secondaryAction) && (
            <div className="mt-7 flex flex-wrap gap-3">
              {primaryAction && (
                <HeroAction
                  action={primaryAction}
                  primary
                />
              )}

              {secondaryAction && (
                <HeroAction
                  action={secondaryAction}
                />
              )}
            </div>
          )}
        </div>

        {children && (
          <div className="relative shrink-0">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

function HeroAction({ action, primary = false }) {
  const className = primary
    ? "bg-white text-indigo-700 hover:bg-indigo-50"
    : "border border-white/30 bg-white/10 text-white hover:bg-white/20";

  if (action.onClick) {
    return (
      <button
        type="button"
        onClick={action.onClick}
        className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-black transition ${className}`}
      >
        {action.icon && <action.icon size={18} />}

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
      className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-black transition ${className}`}
    >
      {action.icon && <action.icon size={18} />}

      {action.label}

      {action.showArrow !== false && (
        <ChevronRight size={18} />
      )}
    </Link>
  );
}

export default HeroBanner;
import { createElement, isValidElement } from "react";

const colorStyles = {
  indigo: {
    icon: "bg-indigo-100 text-indigo-600",
    value: "text-slate-950",
  },
  emerald: {
    icon: "bg-emerald-100 text-emerald-600",
    value: "text-emerald-700",
  },
  cyan: {
    icon: "bg-cyan-100 text-cyan-600",
    value: "text-cyan-700",
  },
  amber: {
    icon: "bg-amber-100 text-amber-600",
    value: "text-amber-700",
  },
  rose: {
    icon: "bg-rose-100 text-rose-600",
    value: "text-rose-700",
  },
};

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle = "",
  color = "indigo",
  className = "",
}) {
  const selectedColor =
    colorStyles[color] || colorStyles.indigo;

  const renderIcon = () => {
    if (!Icon) {
      return null;
    }

    // Supports: icon={<Users size={24} />}
    if (isValidElement(Icon)) {
      return Icon;
    }

    // Supports: icon={Users}
    return createElement(Icon, {
      size: 24,
      strokeWidth: 2,
    });
  };

  return (
    <article
      className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${selectedColor.icon}`}
      >
        {renderIcon()}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>

      <p
        className={`mt-2 text-3xl font-black ${selectedColor.value}`}
      >
        {value}
      </p>

      {subtitle && (
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {subtitle}
        </p>
      )}
    </article>
  );
}

export default StatCard;
function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  iconClass = "bg-indigo-100 text-indigo-700",
  trend,
  compact = false,
}) {
  return (
    <article
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {Icon && (
          <div
            className={`flex items-center justify-center rounded-xl ${iconClass} ${
              compact
                ? "h-10 w-10"
                : "h-11 w-11"
            }`}
          >
            <Icon size={compact ? 19 : 21} />
          </div>
        )}

        {trend && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-black ${
              trend.type === "positive"
                ? "bg-emerald-100 text-emerald-700"
                : trend.type === "negative"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {trend.label}
          </span>
        )}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 font-black text-slate-950 ${
          compact ? "text-2xl" : "text-3xl"
        }`}
      >
        {value}
      </p>

      {note && (
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {note}
        </p>
      )}
    </article>
  );
}

export default MetricCard;
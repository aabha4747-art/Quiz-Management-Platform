function DashboardCard({
  title,
  description,
  action,
  children,
  className = "",
  bodyClassName = "",
  compact = false,
}) {
  return (
    <section
      className={`ui-surface ${
        compact ? "p-4" : "p-6"
      } ${className}`}
    >
      {(title || description || action) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && (
              <h2 className="text-xl font-black text-slate-950">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {description}
              </p>
            )}
          </div>

          {action && (
            <div className="shrink-0">
              {action}
            </div>
          )}
        </div>
      )}

      <div
        className={`${
          title || description || action
            ? "mt-6"
            : ""
        } ${bodyClassName}`}
      >
        {children}
      </div>
    </section>
  );
}

export default DashboardCard;
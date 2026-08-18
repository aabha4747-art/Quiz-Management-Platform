function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-2 text-3xl font-black text-slate-950">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

export default SectionHeader;
const statusStyles = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-slate-200 text-slate-700",

  PUBLISHED: "bg-indigo-100 text-indigo-700",
  DRAFT: "bg-slate-200 text-slate-700",
  ARCHIVED: "bg-amber-100 text-amber-700",

  PASSED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-rose-100 text-rose-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  EXPIRED: "bg-amber-100 text-amber-700",

  EASY: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HARD: "bg-rose-100 text-rose-700",

  PUBLIC: "bg-cyan-100 text-cyan-700",
  PRIVATE: "bg-violet-100 text-violet-700",
};

function formatStatusLabel(value) {
  return String(value || "UNKNOWN")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function StatusBadge({
  status,
  label,
  className = "",
  size = "md",
}) {
  const normalizedStatus = String(
    status || "UNKNOWN"
  ).toUpperCase();

  const style =
    statusStyles[normalizedStatus] ||
    "bg-slate-100 text-slate-700";

  const sizeClass =
    size === "sm"
      ? "px-2.5 py-1 text-[10px]"
      : "px-3 py-1.5 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-black ${style} ${sizeClass} ${className}`}
    >
      {label || formatStatusLabel(normalizedStatus)}
    </span>
  );
}

export default StatusBadge;
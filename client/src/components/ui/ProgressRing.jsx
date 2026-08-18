function ProgressRing({
  value = 0,
  label = "Progress",
  size = "md",
  color = "#4f46e5",
  trackColor = "#e2e8f0",
}) {
  const safeValue = Math.min(
    Math.max(Number(value || 0), 0),
    100
  );

  const sizes = {
    sm: {
      outer: "h-32 w-32",
      inner: "h-24 w-24",
      value: "text-2xl",
      label: "text-[10px]",
    },
    md: {
      outer: "h-40 w-40",
      inner: "h-28 w-28",
      value: "text-3xl",
      label: "text-xs",
    },
    lg: {
      outer: "h-48 w-48",
      inner: "h-36 w-36",
      value: "text-4xl",
      label: "text-sm",
    },
  };

  const selectedSize = sizes[size] || sizes.md;
  const degrees = safeValue * 3.6;

  return (
    <div
      role="img"
      aria-label={`${label}: ${safeValue.toFixed(0)} percent`}
      className={`relative flex items-center justify-center rounded-full ${selectedSize.outer}`}
      style={{
        background: `conic-gradient(
          ${color} ${degrees}deg,
          ${trackColor} ${degrees}deg
        )`,
      }}
    >
      <div
        className={`flex flex-col items-center justify-center rounded-full bg-white shadow-inner ${selectedSize.inner}`}
      >
        <p
          className={`font-black text-slate-950 ${selectedSize.value}`}
        >
          {safeValue.toFixed(0)}%
        </p>

        <p
          className={`mt-1 font-black uppercase tracking-wider text-slate-500 ${selectedSize.label}`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

export default ProgressRing;
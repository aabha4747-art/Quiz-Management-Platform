const variants = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-300",
  secondary:
    "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-200",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-300",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-300",
};

function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
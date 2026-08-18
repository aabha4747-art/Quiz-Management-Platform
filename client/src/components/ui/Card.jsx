function Card({
  children,
  className = "",
  hover = false,
  padding = true,
}) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
        ${
          padding ? "p-6" : ""
        }
        ${
          hover
            ? "transition hover:-translate-y-1 hover:shadow-xl"
            : ""
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Card;
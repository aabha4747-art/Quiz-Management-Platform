function PageContainer({
  children,
  className = "",
  maxWidth = "7xl",
  spacing = "default",
}) {
  const maxWidthClasses = {
    full: "max-w-none",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  };

  const spacingClasses = {
    compact: "space-y-5",
    default: "space-y-8",
    relaxed: "space-y-10",
  };

  const selectedMaxWidth =
    maxWidthClasses[maxWidth] ||
    maxWidthClasses["7xl"];

  const selectedSpacing =
    spacingClasses[spacing] ||
    spacingClasses.default;

  return (
    <main className={`ui-page ${className}`}>
      <div
        className={`mx-auto ${selectedMaxWidth} ${selectedSpacing}`}
      >
        {children}
      </div>
    </main>
  );
}

export default PageContainer;
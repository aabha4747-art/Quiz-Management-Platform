import {
  RotateCcw,
  Search,
} from "lucide-react";

function FilterBar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  children,
  onReset,
  resetDisabled = false,
  className = "",
}) {
  return (
    <section
      className={`ui-surface p-4 sm:p-5 ${className}`}
    >
      <div className="grid gap-4 xl:grid-cols-[1.4fr_auto]">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="ui-input pl-12"
          />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center xl:justify-end">
          {children}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={resetDisabled}
              className="ui-button-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={17} />
              Reset
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function FilterSelect({
  value,
  onChange,
  children,
  ariaLabel,
  className = "",
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      className={`ui-input min-w-44 bg-white ${className}`}
    >
      {children}
    </select>
  );
}

FilterBar.Select = FilterSelect;

export default FilterBar;
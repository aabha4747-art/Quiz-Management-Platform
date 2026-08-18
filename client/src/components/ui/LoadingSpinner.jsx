import { LoaderCircle } from "lucide-react";

function LoadingSpinner({
  fullScreen = false,
  title = "Loading...",
  message = "Please wait while we prepare your content.",
  size = "md",
}) {
  const sizeClasses = {
    sm: {
      container: "h-9 w-9",
      icon: 20,
    },
    md: {
      container: "h-12 w-12",
      icon: 26,
    },
    lg: {
      container: "h-16 w-16",
      icon: 34,
    },
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  const content = (
    <div className="flex flex-col items-center justify-center text-center">
      <div
        className={`flex ${selectedSize.container} items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600`}
      >
        <LoaderCircle
          size={selectedSize.icon}
          className="animate-spin"
        />
      </div>

      <p className="mt-5 text-lg font-black text-slate-950">
        {title}
      </p>

      {message && (
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
          {content}
        </section>
      </main>
    );
  }

  return (
    <div className="flex min-h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white p-8">
      {content}
    </div>
  );
}

export default LoadingSpinner;
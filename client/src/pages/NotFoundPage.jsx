import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-10">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-600">
          <SearchX size={38} />
        </div>

        <p className="mt-7 text-sm font-black uppercase tracking-[0.2em] text-indigo-600">
          Error 404
        </p>

        <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">
          Page not found
        </h1>

        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-500">
          The page may have been moved, deleted, or the address may be incorrect.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Go back
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700"
          >
            <Home size={18} />
            Go to home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default NotFoundPage;
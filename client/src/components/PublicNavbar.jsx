import { Link } from "react-router-dom";
import Button from "./ui/Button";

function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-black text-white shadow-lg shadow-indigo-200">
            Q
          </div>

          <div>
            <p className="text-lg font-bold text-slate-900">QuizNova</p>
            <p className="text-xs text-slate-500">Learn. Test. Improve.</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600">
            Features
          </a>
          <a href="#categories" className="text-sm font-medium text-slate-600 hover:text-indigo-600">
            Categories
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600">
            How it works
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="secondary" className="px-4 py-2.5">
              Login
            </Button>
          </Link>

          <Link to="/register" className="hidden sm:block">
            <Button className="px-4 py-2.5">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default PublicNavbar;
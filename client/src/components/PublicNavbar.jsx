import { Link } from "react-router-dom";
import Button from "./ui/Button";

function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* BioNova brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-500 text-lg font-black text-white shadow-lg shadow-teal-100">
            B
          </div>

          <div>
            <p className="text-lg font-bold text-slate-900">BioNova</p>
            <p className="text-xs text-slate-500">
              Biotechnology Learning Platform
            </p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-slate-600 hover:text-teal-600"
          >
            Features
          </a>

          <a
            href="#categories"
            className="text-sm font-medium text-slate-600 hover:text-teal-600"
          >
            Categories
          </a>

          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-600 hover:text-teal-600"
          >
            How it works
          </a>
        </nav>

        {/* Authentication buttons */}
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
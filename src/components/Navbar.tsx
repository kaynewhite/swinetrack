import { Logo } from "./Logo";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-slate-600 hover:text-brand-600 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm shadow-brand-600/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

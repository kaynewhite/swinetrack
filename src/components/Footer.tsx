import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo className="invert brightness-0 contrast-200" />
            <p className="text-sm mt-2 max-w-sm text-center md:text-left">
              Farm-to-Market Swine Traceability System for predictive and prescriptive agricultural intelligence.
            </p>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} SwineTrack. Capstone Project.
          </div>
        </div>
      </div>
    </footer>
  );
}

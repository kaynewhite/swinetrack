import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Logo dark />
          <p className="text-sm mt-1 max-w-sm text-center md:text-left text-slate-500">
            Farm-to-Market Swine Traceability System — Laguna Province Pilot
          </p>
        </div>
        <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} SwineTrack. Capstone Project.</p>
      </div>
    </footer>
  );
}

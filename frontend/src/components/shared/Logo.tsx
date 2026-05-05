import { PiggyBank } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="bg-brand-600 text-white p-1.5 rounded-lg">
        <PiggyBank className="w-5 h-5" />
      </div>
      <span className={`font-display font-bold text-xl tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
        SwineTrack
      </span>
    </Link>
  );
}

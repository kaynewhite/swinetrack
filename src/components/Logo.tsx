import { PiggyBank } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="bg-brand-600 text-white p-1.5 rounded-lg">
        <PiggyBank className="w-5 h-5" />
      </div>
      <span className="font-display font-bold text-xl tracking-tight text-slate-900">
        SwineTrack
      </span>
    </Link>
  );
}

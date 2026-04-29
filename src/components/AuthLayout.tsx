import { ReactNode } from "react";
import { Logo } from "./Logo";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center">
      <div className="absolute top-0 w-full p-6 flex justify-between items-center">
        <Logo />
        <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {subtitle}
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-soft sm:rounded-2xl sm:px-10 border border-slate-100">
          {children}
        </div>
      </div>
      
      <div className="absolute bottom-0 w-full p-6 text-center">
        <p className="text-xs text-slate-400">
          Protected by SwineTrack Traceability System
        </p>
      </div>
    </div>
  );
}

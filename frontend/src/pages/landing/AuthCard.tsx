import React from "react";
import { Logo } from "../../components/shared/Logo";
import { Link } from "react-router-dom";

interface AuthCardProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  iconBg?: string;
  children: React.ReactNode;
  backLabel?: string;
  backTo?: string;
}

export function AuthCard({ title, subtitle, icon, iconBg = "bg-brand-600", children, backLabel, backTo = "/" }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-brand-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-4" />
          {icon && (
            <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
              {icon}
            </div>
          )}
          <h1 className="text-2xl font-display font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          {children}
        </div>
        {backLabel && (
          <p className="text-center text-sm text-slate-500 mt-5">
            <Link to={backTo} className="text-brand-600 hover:underline font-medium">{backLabel}</Link>
          </p>
        )}
      </div>
    </div>
  );
}

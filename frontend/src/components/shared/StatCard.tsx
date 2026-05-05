import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
  sub?: string;
  subColor?: string;
}

export function StatCard({ label, value, icon, iconBg = "bg-brand-100 text-brand-600", sub, subColor = "text-slate-500" }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        {sub && <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>}
      </div>
    </div>
  );
}

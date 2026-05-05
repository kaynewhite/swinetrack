import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { StatCard } from "../../components/shared/StatCard";
import { Badge } from "../../components/shared/Badge";
import { useApi } from "../../lib/api";
import { LayoutDashboard, ClipboardList, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

export const VET_NAV = [
  { label: "Dashboard", path: "/vet", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Field Inspections", path: "/vet/inspections", icon: <ClipboardList className="w-5 h-5" /> },
];

export default function VetDashboard() {
  const api = useApi();
  const { user } = useUser();
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/diseases"), api.get("/diseases/stats/summary")])
      .then(([r, s]) => { setReports(r); setStats(s); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const pending = reports.filter(r => r.status === "pending").length;

  return (
    <DashboardLayout navItems={VET_NAV} role="Veterinarian" roleColor="bg-violet-600">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Welcome, Dr. {user?.firstName || "Veterinarian"}</h1>
          <p className="text-slate-500 text-sm mt-1">Field veterinary officer dashboard — review and verify disease reports.</p>
        </div>

        {!loading && stats && (
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard label="Pending Review" value={pending} icon={<Clock className="w-6 h-6" />} iconBg="bg-amber-100 text-amber-600" />
            <StatCard label="Verified Reports" value={stats.verified} icon={<CheckCircle className="w-6 h-6" />} iconBg="bg-green-100 text-green-600" />
            <StatCard label="High-Risk Viral" value={stats.high_risk_viral} icon={<AlertTriangle className="w-6 h-6" />} iconBg="bg-red-100 text-red-600" />
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Pending Disease Reports</h2>
            <Link to="/vet/inspections" className="text-xs text-violet-600 hover:underline font-medium">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : reports.filter(r => r.status === "pending").length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No pending reports.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.filter(r => r.status === "pending").slice(0, 6).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{r.disease_name}</p>
                    <p className="text-xs text-slate-500">{r.farm_name} · {r.municipality}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={r.disease_category === "high_risk_viral" ? "red" : "yellow"}>
                      {r.disease_category?.replace(/_/g, " ")}
                    </Badge>
                    <Link to="/vet/inspections" className="text-xs text-violet-600 hover:underline font-medium">Review</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

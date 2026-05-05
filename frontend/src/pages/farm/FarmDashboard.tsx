import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { StatCard } from "../../components/shared/StatCard";
import { Badge, riskColor } from "../../components/shared/Badge";
import { useApi } from "../../lib/api";
import {
  Home, AlertTriangle, FileText, Map, User,
  PlusCircle, TrendingUp, CheckCircle, Clock
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";

const NAV = [
  { label: "Dashboard", path: "/farm", icon: <Home className="w-5 h-5" /> },
  { label: "My Farm", path: "/farm/register", icon: <PlusCircle className="w-5 h-5" /> },
  { label: "Disease Report", path: "/farm/report", icon: <AlertTriangle className="w-5 h-5" /> },
  { label: "Map View", path: "/farm/map", icon: <Map className="w-5 h-5" /> },
  { label: "Permits", path: "/farm/permits", icon: <FileText className="w-5 h-5" /> },
  { label: "My Profile", path: "/farm/profile", icon: <User className="w-5 h-5" /> },
];

export default function FarmDashboard() {
  const api = useApi();
  const { user } = useUser();
  const [farms, setFarms] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [permits, setPermits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/farms"),
      api.get("/diseases"),
      api.get("/permits"),
    ]).then(([f, d, p]) => {
      setFarms(f);
      setReports(d);
      setPermits(p);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalSwine = farms.reduce((s: number, f: any) => s + (Number(f.total_swine) || 0), 0);
  const pendingReports = reports.filter((r: any) => r.status === "pending").length;
  const pendingPermits = permits.filter((p: any) => p.status === "pending").length;

  return (
    <DashboardLayout navItems={NAV} role="Farm Owner" roleColor="bg-emerald-600">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">
            Welcome back, {user?.firstName || "Farmer"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's an overview of your farm operations.</p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Registered Farms" value={farms.length} icon={<Home className="w-6 h-6" />} />
            <StatCard label="Total Swine" value={totalSwine.toLocaleString()} icon={<TrendingUp className="w-6 h-6" />} iconBg="bg-blue-100 text-blue-600" />
            <StatCard label="Pending Reports" value={pendingReports} icon={<AlertTriangle className="w-6 h-6" />} iconBg="bg-amber-100 text-amber-600" />
            <StatCard label="Pending Permits" value={pendingPermits} icon={<FileText className="w-6 h-6" />} iconBg="bg-violet-100 text-violet-600" />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Farms */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">My Farms</h2>
              <Link to="/farm/register" className="text-xs text-brand-600 hover:underline font-medium flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" /> Register Farm
              </Link>
            </div>
            {farms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm mb-3">No farms registered yet.</p>
                <Link to="/farm/register" className="inline-block bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Register Your Farm</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {farms.map((farm: any) => (
                  <div key={farm.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{farm.farm_name}</p>
                      <p className="text-xs text-slate-500">{farm.municipality}, {farm.barangay}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{Number(farm.total_swine).toLocaleString()}</p>
                      <p className="text-xs text-slate-400">swine</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">Recent Disease Reports</h2>
              <Link to="/farm/report" className="text-xs text-brand-600 hover:underline font-medium">+ New Report</Link>
            </div>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No disease reports filed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.slice(0, 5).map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{r.disease_name}</p>
                      <p className="text-xs text-slate-500">{r.farm_name} · {new Date(r.reported_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge color={r.status === "verified" ? "green" : r.status === "rejected" ? "red" : "yellow"}>
                        {r.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Register Farm", path: "/farm/register", icon: <Home className="w-5 h-5" />, color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
              { label: "Report Disease", path: "/farm/report", icon: <AlertTriangle className="w-5 h-5" />, color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
              { label: "Request Permit", path: "/farm/permits", icon: <FileText className="w-5 h-5" />, color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
              { label: "View Map", path: "/farm/map", icon: <Map className="w-5 h-5" />, color: "bg-violet-50 text-violet-700 hover:bg-violet-100" },
            ].map((a) => (
              <Link key={a.path} to={a.path} className={`flex items-center gap-3 p-4 rounded-xl font-medium text-sm transition-colors ${a.color}`}>
                {a.icon} {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

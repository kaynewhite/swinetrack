import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { StatCard } from "../../components/shared/StatCard";
import { Badge, riskColor } from "../../components/shared/Badge";
import { useApi } from "../../lib/api";
import { LayoutDashboard, Package, AlertTriangle, Map, BarChart2, TrendingUp, ShieldCheck, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const PAO_NAV = [
  { label: "Dashboard", path: "/pao", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Supply Monitoring", path: "/pao/supply", icon: <Package className="w-5 h-5" /> },
  { label: "Disease Overview", path: "/pao/diseases", icon: <AlertTriangle className="w-5 h-5" /> },
  { label: "Map Monitoring", path: "/pao/map", icon: <Map className="w-5 h-5" /> },
  { label: "Reports", path: "/pao/reports", icon: <BarChart2 className="w-5 h-5" /> },
];

export default function PAODashboard() {
  const api = useApi();
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [diseaseStats, setDiseaseStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/map/municipalities"),
      api.get("/analytics/forecasts"),
      api.get("/diseases/stats/summary"),
    ]).then(([m, f, d]) => {
      setMunicipalities(m);
      setForecasts(f);
      setDiseaseStats(d);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalFarms = municipalities.reduce((s, m) => s + Number(m.farm_count), 0);
  const totalSwine = municipalities.reduce((s, m) => s + Number(m.swine_population || 0), 0);
  const criticalMuns = municipalities.filter(m => m.risk_level === "critical" || m.risk_level === "high").length;
  const criticalForecasts = forecasts.filter(f => f.risk_level === "critical").length;

  const chartData = municipalities.slice(0, 8).map(m => ({
    name: m.municipality.slice(0, 6),
    farms: Number(m.farm_count),
    reports: Number(m.recent_reports),
  }));

  return (
    <DashboardLayout navItems={PAO_NAV} role="PAO Monitor" roleColor="bg-slate-700">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">PAO Provincial Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Provincial Agriculture Office — Province-wide swine health overview</p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl border animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Registered Farms" value={totalFarms.toLocaleString()} icon={<TrendingUp className="w-6 h-6" />} />
            <StatCard label="Total Swine Population" value={totalSwine.toLocaleString()} icon={<Activity className="w-6 h-6" />} iconBg="bg-blue-100 text-blue-600" />
            <StatCard label="High/Critical Zones" value={criticalMuns} icon={<AlertTriangle className="w-6 h-6" />} iconBg="bg-orange-100 text-orange-600" />
            <StatCard label="Critical Forecasts" value={criticalForecasts} icon={<ShieldCheck className="w-6 h-6" />} iconBg="bg-red-100 text-red-600" />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Municipality chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Farms & Reports by Municipality</h2>
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="farms" name="Farms" fill="#475569" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reports" name="Reports" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* High-risk municipalities */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Municipality Risk Overview</h2>
            <div className="space-y-2.5 max-h-64 overflow-y-auto scrollbar-thin">
              {municipalities.map((m: any) => (
                <div key={m.municipality} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{m.municipality}</p>
                    <p className="text-xs text-slate-500">{m.farm_count} farms · {Number(m.swine_population || 0).toLocaleString()} swine</p>
                  </div>
                  <Badge color={riskColor(m.risk_level || "low")}>{m.risk_level || "low"}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Critical forecasts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Province-wide Disease Forecasts</h2>
          {forecasts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No forecasts generated yet. MAO must run the forecasting engine first.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="pb-3 pr-4 font-semibold">Municipality</th>
                  <th className="pb-3 pr-4 font-semibold">Disease</th>
                  <th className="pb-3 pr-4 font-semibold">Predicted Cases</th>
                  <th className="pb-3 pr-4 font-semibold">Risk Level</th>
                  <th className="pb-3 font-semibold">Confidence</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {forecasts.slice(0, 10).map((f: any) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-4 font-medium text-slate-800">{f.municipality}</td>
                      <td className="py-2.5 pr-4 text-slate-600 text-xs">{f.disease_name}</td>
                      <td className="py-2.5 pr-4 font-bold text-slate-900">{f.predicted_cases}</td>
                      <td className="py-2.5 pr-4"><Badge color={riskColor(f.risk_level)}>{f.risk_level}</Badge></td>
                      <td className="py-2.5 text-slate-600">{Math.round(Number(f.confidence_score) * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

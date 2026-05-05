import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { Badge, riskColor } from "../../components/shared/Badge";
import { StatCard } from "../../components/shared/StatCard";
import { useApi } from "../../lib/api";
import { PAO_NAV } from "./PAODashboard";
import { AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export default function PAODiseases() {
  const api = useApi();
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/diseases"),
      api.get("/diseases/stats/summary"),
      api.get("/analytics/forecasts"),
      api.get("/diseases/stats/monthly"),
    ]).then(([r, s, f, m]) => {
      setReports(r);
      setStats(s);
      setForecasts(f);
      const map: Record<string, { viral: number; other: number }> = {};
      m.forEach((row: any) => {
        const label = new Date(row.month).toLocaleDateString("en-PH", { month: "short", year: "2-digit" });
        if (!map[label]) map[label] = { viral: 0, other: 0 };
        if (row.disease_category === "high_risk_viral") map[label].viral += Number(row.case_count);
        else map[label].other += Number(row.case_count);
      });
      setMonthly(Object.entries(map).slice(-8).map(([month, v]) => ({ month, ...v })));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout navItems={PAO_NAV} role="PAO Monitor" roleColor="bg-slate-700">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Disease Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Province-wide disease monitoring and outbreak overview.</p>
        </div>

        {stats && !loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Reports" value={stats.total_reports} icon={<AlertTriangle className="w-6 h-6" />} />
            <StatCard label="High-Risk Viral" value={stats.high_risk_viral} icon={<Activity className="w-6 h-6" />} iconBg="bg-red-100 text-red-600" />
            <StatCard label="Total Affected" value={Number(stats.total_affected || 0).toLocaleString()} icon={<TrendingUp className="w-6 h-6" />} iconBg="bg-orange-100 text-orange-600" />
            <StatCard label="Pending Review" value={stats.pending} icon={<AlertTriangle className="w-6 h-6" />} iconBg="bg-amber-100 text-amber-600" />
          </div>
        )}

        {/* Monthly trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Monthly Disease Trend</h2>
          {monthly.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="viral" name="High-Risk Viral" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="other" name="Other Diseases" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Forecasts by risk */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Province-wide Disease Risk Forecasts</h2>
          {forecasts.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No forecasts generated yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="pb-3 pr-4 font-semibold">Municipality</th>
                  <th className="pb-3 pr-4 font-semibold">Disease</th>
                  <th className="pb-3 pr-4 font-semibold">Predicted Cases</th>
                  <th className="pb-3 pr-4 font-semibold">Risk</th>
                  <th className="pb-3 font-semibold">Model</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {forecasts.map((f: any) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-4 font-medium text-slate-800">{f.municipality}</td>
                      <td className="py-2.5 pr-4 text-slate-600 text-xs">{f.disease_name}</td>
                      <td className="py-2.5 pr-4 font-bold">{f.predicted_cases}</td>
                      <td className="py-2.5 pr-4"><Badge color={riskColor(f.risk_level)}>{f.risk_level}</Badge></td>
                      <td className="py-2.5 text-slate-500 text-xs">{f.model_used}</td>
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

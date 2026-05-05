import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { StatCard } from "../../components/shared/StatCard";
import { useApi } from "../../lib/api";
import { PAO_NAV } from "./PAODashboard";
import { BarChart2, TrendingUp, AlertTriangle, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#16a34a", "#eab308", "#f97316", "#ef4444"];

export default function PAOReports() {
  const api = useApi();
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [diseaseStats, setDiseaseStats] = useState<any>(null);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/map/municipalities"),
      api.get("/diseases/stats/summary"),
      api.get("/analytics/forecasts"),
    ]).then(([m, d, f]) => {
      setMunicipalities(m);
      setDiseaseStats(d);
      setForecasts(f);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalFarms = municipalities.reduce((s, m) => s + Number(m.farm_count), 0);
  const totalSwine = municipalities.reduce((s, m) => s + Number(m.swine_population || 0), 0);

  const riskBreakdown = ["low", "moderate", "high", "critical"].map(r => ({
    name: r.charAt(0).toUpperCase() + r.slice(1),
    value: municipalities.filter(m => (m.risk_level || "low") === r).length,
  }));

  const munChartData = municipalities.slice(0, 8).map(m => ({
    name: m.municipality.slice(0, 6),
    farms: Number(m.farm_count),
    swine: Math.round(Number(m.swine_population || 0) / 100),
  }));

  return (
    <DashboardLayout navItems={PAO_NAV} role="PAO Monitor" roleColor="bg-slate-700">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Provincial Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Comprehensive province-wide swine health analytics.</p>
        </div>

        {!loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Farms" value={totalFarms} icon={<Users className="w-6 h-6" />} />
            <StatCard label="Total Swine" value={totalSwine.toLocaleString()} icon={<TrendingUp className="w-6 h-6" />} iconBg="bg-blue-100 text-blue-600" />
            <StatCard label="Disease Reports" value={diseaseStats?.total_reports || 0} icon={<AlertTriangle className="w-6 h-6" />} iconBg="bg-red-100 text-red-600" />
            <StatCard label="Active Forecasts" value={forecasts.length} icon={<BarChart2 className="w-6 h-6" />} iconBg="bg-violet-100 text-violet-600" />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Municipality comparison */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Farms per Municipality</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={munChartData} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="farms" name="Farms" fill="#475569" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Municipality Risk Distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={riskBreakdown} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name} (${value})` : ""} labelLine={false}>
                  {riskBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend iconSize={10} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Full municipality table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Municipality Summary Table</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                <th className="pb-3 pr-4 font-semibold">Municipality</th>
                <th className="pb-3 pr-4 font-semibold">Farms</th>
                <th className="pb-3 pr-4 font-semibold">Swine</th>
                <th className="pb-3 pr-4 font-semibold">Recent Reports</th>
                <th className="pb-3 pr-4 font-semibold">Viral Reports</th>
                <th className="pb-3 font-semibold">Risk Level</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {municipalities.map((m: any) => (
                  <tr key={m.municipality} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-4 font-medium text-slate-800">{m.municipality}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{m.farm_count}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{Number(m.swine_population || 0).toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{m.recent_reports}</td>
                    <td className="py-2.5 pr-4 text-red-600">{m.viral_reports}</td>
                    <td className="py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize
                        ${m.risk_level === "critical" ? "bg-red-100 text-red-700" :
                          m.risk_level === "high" ? "bg-orange-100 text-orange-700" :
                          m.risk_level === "moderate" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"}`}>
                        {m.risk_level || "low"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { StatCard } from "../../components/shared/StatCard";
import { useApi } from "../../lib/api";
import { MAO_NAV } from "./MAODashboard";
import { BarChart2, TrendingUp, AlertTriangle, FileText } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

const PIE_COLORS = ["#ef4444", "#f97316", "#3b82f6"];

export default function MAOReports() {
  const api = useApi();
  const [diseaseStats, setDiseaseStats] = useState<any>(null);
  const [farmStats, setFarmStats] = useState<any>(null);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/diseases/stats/summary"),
      api.get("/farms/stats/summary"),
      api.get("/diseases/stats/monthly"),
      api.get("/map/municipalities"),
    ]).then(([ds, fs, mo, mu]) => {
      setDiseaseStats(ds);
      setFarmStats(fs);
      const map: Record<string, number> = {};
      mo.forEach((r: any) => {
        const label = new Date(r.month).toLocaleDateString("en-PH", { month: "short", year: "2-digit" });
        map[label] = (map[label] || 0) + Number(r.case_count);
      });
      setMonthly(Object.entries(map).slice(-8).map(([month, cases]) => ({ month, cases })));
      setMunicipalities(mu.slice(0, 8));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const pieData = diseaseStats ? [
    { name: "High-Risk Viral", value: Number(diseaseStats.high_risk_viral) || 0 },
    { name: "Bacterial", value: Math.max(0, Number(diseaseStats.total_reports) - Number(diseaseStats.high_risk_viral)) || 0 },
    { name: "Pending", value: Number(diseaseStats.pending) || 0 },
  ] : [];

  return (
    <DashboardLayout navItems={MAO_NAV} role="MAO Admin" roleColor="bg-blue-600">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Comprehensive disease, farm, and supply chain analytics.</p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl border animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Disease Reports" value={diseaseStats?.total_reports || 0} icon={<AlertTriangle className="w-6 h-6" />} />
            <StatCard label="Total Affected Swine" value={Number(diseaseStats?.total_affected || 0).toLocaleString()} icon={<TrendingUp className="w-6 h-6" />} iconBg="bg-red-100 text-red-600" />
            <StatCard label="Total Mortality" value={Number(diseaseStats?.total_mortality || 0)} icon={<FileText className="w-6 h-6" />} iconBg="bg-orange-100 text-orange-600" />
            <StatCard label="Registered Farms" value={farmStats?.total_farms || 0} icon={<BarChart2 className="w-6 h-6" />} iconBg="bg-blue-100 text-blue-600" />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Monthly trend */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Monthly Case Trend</h2>
            {monthly.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cases" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Disease breakdown pie */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Disease Category Breakdown</h2>
            {pieData.every(d => d.value === 0) ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend iconSize={10} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Per-municipality bar chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Reports per Municipality</h2>
          {municipalities.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={municipalities} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="municipality" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="recent_reports" name="Recent Reports" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="viral_reports" name="Viral Reports" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Farm type summary */}
        {farmStats && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Farm Summary</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Backyard Farms", value: farmStats.backyard_farms, color: "bg-emerald-50 border-emerald-200" },
                { label: "Commercial Farms", value: farmStats.commercial_farms, color: "bg-blue-50 border-blue-200" },
                { label: "Active Farms", value: farmStats.active_farms, color: "bg-green-50 border-green-200" },
                { label: "Quarantined", value: farmStats.quarantined_farms, color: "bg-red-50 border-red-200" },
              ].map(s => (
                <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                  <p className="text-2xl font-bold text-slate-900">{s.value || 0}</p>
                  <p className="text-sm text-slate-600 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

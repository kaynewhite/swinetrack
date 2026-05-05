import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { StatCard } from "../../components/shared/StatCard";
import { Badge, riskColor } from "../../components/shared/Badge";
import { useApi } from "../../lib/api";
import {
  LayoutDashboard, Users, AlertTriangle, Map, FileText,
  ShieldCheck, BarChart2, Database, TrendingUp, Activity,
  CheckCircle, Clock, Zap
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const MAO_NAV = [
  { label: "Dashboard", path: "/mao", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Farm Management", path: "/mao/farms", icon: <Users className="w-5 h-5" /> },
  { label: "Disease Cases", path: "/mao/diseases", icon: <AlertTriangle className="w-5 h-5" /> },
  { label: "Map Monitoring", path: "/mao/map", icon: <Map className="w-5 h-5" /> },
  { label: "Permit Management", path: "/mao/permits", icon: <FileText className="w-5 h-5" /> },
  { label: "Prescriptive System", path: "/mao/prescriptive", icon: <ShieldCheck className="w-5 h-5" /> },
  { label: "Reports & Analytics", path: "/mao/reports", icon: <BarChart2 className="w-5 h-5" /> },
  { label: "Training Data", path: "/mao/training-data", icon: <Database className="w-5 h-5" /> },
];

export default function MAODashboard() {
  const api = useApi();
  const [farmStats, setFarmStats] = useState<any>(null);
  const [diseaseStats, setDiseaseStats] = useState<any>(null);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/farms/stats/summary"),
      api.get("/diseases/stats/summary"),
      api.get("/analytics/forecasts"),
      api.get("/analytics/recommendations?status=active"),
      api.get("/diseases/stats/monthly"),
    ]).then(([fs, ds, fc, rc, mo]) => {
      setFarmStats(fs);
      setDiseaseStats(ds);
      setForecasts(fc.slice(0, 5));
      setRecommendations(rc.slice(0, 4));
      // Process monthly data for chart
      const map: Record<string, number> = {};
      mo.forEach((r: any) => {
        const label = new Date(r.month).toLocaleDateString("en-PH", { month: "short", year: "2-digit" });
        map[label] = (map[label] || 0) + Number(r.case_count);
      });
      setMonthly(Object.entries(map).slice(-6).map(([month, cases]) => ({ month, cases })));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const urgentRecs = recommendations.filter(r => r.priority === "urgent").length;

  return (
    <DashboardLayout navItems={MAO_NAV} role="MAO Admin" roleColor="bg-blue-600">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">MAO Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Municipal Agriculture Office — Disease Monitoring & Management</p>
          </div>
          <Link to="/mao/prescriptive"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            <Zap className="w-4 h-4" /> Run Forecast
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Farms" value={Number(farmStats?.total_farms || 0).toLocaleString()} icon={<Users className="w-6 h-6" />} sub={`${farmStats?.quarantined_farms || 0} quarantined`} subColor="text-red-500" />
            <StatCard label="Total Swine" value={Number(farmStats?.total_swine || 0).toLocaleString()} icon={<TrendingUp className="w-6 h-6" />} iconBg="bg-blue-100 text-blue-600" />
            <StatCard label="Pending Reports" value={Number(diseaseStats?.pending || 0)} icon={<AlertTriangle className="w-6 h-6" />} iconBg="bg-amber-100 text-amber-600" sub={`${diseaseStats?.high_risk_viral || 0} high-risk viral`} subColor="text-red-500" />
            <StatCard label="Urgent Alerts" value={urgentRecs} icon={<ShieldCheck className="w-6 h-6" />} iconBg="bg-red-100 text-red-600" sub="Needs immediate action" subColor="text-red-500" />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Monthly trend chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" /> Disease Case Trend (6 months)
            </h2>
            {monthly.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No historical data yet. Add training data to generate forecasts.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="cases" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Latest forecasts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">Latest Forecasts</h2>
              <Link to="/mao/prescriptive" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            {forecasts.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-400 text-sm mb-3">No forecasts generated yet.</p>
                <Link to="/mao/prescriptive" className="text-xs text-blue-600 hover:underline font-medium">Run your first forecast →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {forecasts.map((f: any) => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{f.municipality}</p>
                      <p className="text-xs text-slate-500 truncate">{f.disease_name}</p>
                    </div>
                    <Badge color={riskColor(f.risk_level)}>{f.risk_level}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Recommendations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Active Recommendations
            </h2>
            <Link to="/mao/prescriptive" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {recommendations.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">No active recommendations. Run a forecast to generate prescriptive actions.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {recommendations.map((r: any) => (
                <div key={r.id} className={`p-4 rounded-xl border ${r.priority === "urgent" ? "border-red-200 bg-red-50" : r.priority === "high" ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-slate-800 text-sm">{r.action_type}</p>
                    <Badge color={r.priority === "urgent" ? "red" : r.priority === "high" ? "orange" : "blue"}>{r.priority}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{r.recommendation}</p>
                  <p className="text-xs text-slate-400 mt-2">{r.municipality}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Review Disease Reports", path: "/mao/diseases", icon: <AlertTriangle className="w-5 h-5" />, color: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200" },
            { label: "Process Permits", path: "/mao/permits", icon: <FileText className="w-5 h-5" />, color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200" },
            { label: "View Map", path: "/mao/map", icon: <Map className="w-5 h-5" />, color: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200" },
            { label: "Add Training Data", path: "/mao/training-data", icon: <Database className="w-5 h-5" />, color: "bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200" },
          ].map(a => (
            <Link key={a.path} to={a.path} className={`flex items-center gap-3 p-4 rounded-xl font-medium text-sm border transition-colors ${a.color}`}>
              {a.icon} {a.label}
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

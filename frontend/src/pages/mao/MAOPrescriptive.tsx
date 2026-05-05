import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { Badge, riskColor, priorityColor } from "../../components/shared/Badge";
import { useApi } from "../../lib/api";
import { MAO_NAV } from "./MAODashboard";
import { ShieldCheck, Zap, CheckCircle, RefreshCw, Filter } from "lucide-react";
import { MUNICIPALITIES } from "../../lib/constants";

export default function MAOPrescriptive() {
  const api = useApi();
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runMsg, setRunMsg] = useState<string | null>(null);
  const [filterMun, setFilterMun] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/analytics/forecasts"), api.get("/analytics/recommendations?status=active")])
      .then(([f, r]) => { setForecasts(f); setRecommendations(r); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const runForecast = async () => {
    setRunning(true); setRunMsg(null);
    try {
      const res = await api.post("/analytics/forecast", {});
      setRunMsg(`Forecast completed! Analyzed ${res.results?.length || 0} municipality-disease combinations.`);
      load();
    } catch (err: any) {
      setRunMsg(`Error: ${err.message}`);
    } finally { setRunning(false); }
  };

  const updateRecStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/analytics/recommendations/${id}`, { status });
      setRecommendations(r => r.filter(rec => rec.id !== id));
    } catch (err) { console.error(err); }
  };

  const filteredRecs = recommendations.filter(r => {
    const matchMun = filterMun === "all" || r.municipality === filterMun;
    const matchPriority = filterPriority === "all" || r.priority === filterPriority;
    return matchMun && matchPriority;
  });

  const urgentCount = recommendations.filter(r => r.priority === "urgent").length;
  const highCount = recommendations.filter(r => r.priority === "high").length;

  return (
    <DashboardLayout navItems={MAO_NAV} role="MAO Admin" roleColor="bg-blue-600">
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Prescriptive System</h1>
            <p className="text-slate-500 text-sm mt-1">Run ARIMA + Random Forest forecasts and view automated action recommendations.</p>
          </div>
          <button onClick={runForecast} disabled={running}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {running ? "Running Forecast..." : "Run New Forecast"}
          </button>
        </div>

        {runMsg && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${runMsg.startsWith("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
            {runMsg}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { label: "Urgent Actions", value: urgentCount, color: "bg-red-50 border-red-200 text-red-700" },
            { label: "High Priority", value: highCount, color: "bg-orange-50 border-orange-200 text-orange-700" },
            { label: "Total Recommendations", value: recommendations.length, color: "bg-blue-50 border-blue-200 text-blue-700" },
            { label: "Forecasted Municipalities", value: [...new Set(forecasts.map(f => f.municipality))].length, color: "bg-green-50 border-green-200 text-green-700" },
          ].map((s, i) => (
            <div key={i} className={`rounded-2xl border p-5 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Latest Forecasts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" /> Disease Forecasts (ARIMA + Random Forest)
          </h2>
          {forecasts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
              No forecasts yet. Click "Run New Forecast" to start.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="pb-3 pr-4 font-semibold">Municipality</th>
                  <th className="pb-3 pr-4 font-semibold">Disease</th>
                  <th className="pb-3 pr-4 font-semibold">Predicted Cases</th>
                  <th className="pb-3 pr-4 font-semibold">Risk Level</th>
                  <th className="pb-3 pr-4 font-semibold">Confidence</th>
                  <th className="pb-3 font-semibold">Generated</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {forecasts.map((f: any) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-4 font-medium text-slate-800">{f.municipality}</td>
                      <td className="py-3 pr-4 text-slate-600 text-xs">{f.disease_name}</td>
                      <td className="py-3 pr-4 font-bold text-slate-900">{f.predicted_cases}</td>
                      <td className="py-3 pr-4"><Badge color={riskColor(f.risk_level)}>{f.risk_level}</Badge></td>
                      <td className="py-3 pr-4 text-slate-600">{Math.round(Number(f.confidence_score) * 100)}%</td>
                      <td className="py-3 text-slate-500 text-xs">{new Date(f.generated_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Active Recommendations
            </h2>
            <div className="flex gap-2">
              <select value={filterMun} onChange={e => setFilterMun(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="all">All Municipalities</option>
                {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          {filteredRecs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No active recommendations{filterMun !== "all" ? ` for ${filterMun}` : ""}.</div>
          ) : (
            <div className="space-y-3">
              {filteredRecs.map((r: any) => (
                <div key={r.id} className={`p-4 rounded-xl border ${r.priority === "urgent" ? "border-red-200 bg-red-50" : r.priority === "high" ? "border-orange-200 bg-orange-50" : r.priority === "medium" ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-bold text-slate-800 text-sm">{r.action_type}</p>
                        <Badge color={priorityColor(r.priority)}>{r.priority}</Badge>
                        <span className="text-xs text-slate-500">{r.municipality}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{r.recommendation}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => updateRecStatus(r.id, "implemented")}
                        className="text-xs text-green-700 bg-green-100 hover:bg-green-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                        Done
                      </button>
                      <button onClick={() => updateRecStatus(r.id, "dismissed")}
                        className="text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                        Dismiss
                      </button>
                    </div>
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

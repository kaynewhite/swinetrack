import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { Badge, riskColor } from "../../components/shared/Badge";
import { useApi } from "../../lib/api";
import { MAO_NAV } from "./MAODashboard";
import { MapPin, TrendingUp, AlertTriangle } from "lucide-react";

const RISK_DOT: Record<string, string> = {
  low: "bg-green-500", moderate: "bg-yellow-500", high: "bg-orange-500", critical: "bg-red-500"
};
const RISK_BG: Record<string, string> = {
  low: "border-green-200 bg-green-50", moderate: "border-yellow-200 bg-yellow-50",
  high: "border-orange-200 bg-orange-50", critical: "border-red-200 bg-red-50"
};

export default function MAOMap() {
  const api = useApi();
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.get("/map/municipalities"), api.get("/analytics/forecasts")])
      .then(([m, f]) => { setMunicipalities(m); setForecasts(f); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const getMunForecasts = (mun: string) => forecasts.filter(f => f.municipality === mun);

  return (
    <DashboardLayout navItems={MAO_NAV} role="MAO Admin" roleColor="bg-blue-600">
      <div className="space-y-6">
        <div><h1 className="text-2xl font-display font-bold text-slate-900">Map Monitoring</h1>
          <p className="text-slate-500 text-sm mt-1">GIS-based disease risk visualization across Laguna municipalities.</p></div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 bg-white rounded-2xl border border-slate-200 p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">Risk Level:</span>
          {["low", "moderate", "high", "critical"].map(r => (
            <div key={r} className="flex items-center gap-1.5 text-sm">
              <span className={`w-3 h-3 rounded-full ${RISK_DOT[r]}`} />
              <span className="capitalize text-slate-700 font-medium">{r}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(10)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {municipalities.map((m: any) => {
              const risk = m.risk_level || "low";
              const munForecasts = getMunForecasts(m.municipality);
              const isSelected = selected === m.municipality;
              return (
                <div key={m.municipality}
                  onClick={() => setSelected(isSelected ? null : m.municipality)}
                  className={`rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${isSelected ? "border-blue-400 bg-blue-50" : RISK_BG[risk]}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <h3 className="font-bold text-slate-900">{m.municipality}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${RISK_DOT[risk]}`} />
                      <span className="text-xs font-semibold capitalize text-slate-700">{risk}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/70 rounded-lg p-2">
                      <p className="text-sm font-bold text-slate-900">{m.farm_count}</p>
                      <p className="text-xs text-slate-500">Farms</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2">
                      <p className="text-sm font-bold text-slate-900">{Number(m.swine_population || 0).toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Swine</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2">
                      <p className={`text-sm font-bold ${Number(m.recent_reports) > 0 ? "text-red-600" : "text-slate-900"}`}>{m.recent_reports}</p>
                      <p className="text-xs text-slate-500">Reports</p>
                    </div>
                  </div>
                  {isSelected && munForecasts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/60 space-y-2">
                      <p className="text-xs font-semibold text-slate-600 mb-2">Disease Forecasts:</p>
                      {munForecasts.map((f: any) => (
                        <div key={f.id} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 truncate mr-2">{f.disease_name}</span>
                          <Badge color={riskColor(f.risk_level)} size="sm">{f.risk_level}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

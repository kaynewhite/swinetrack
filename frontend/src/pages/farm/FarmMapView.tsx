import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { useApi } from "../../lib/api";
import { Home, AlertTriangle, FileText, Map, User, PlusCircle } from "lucide-react";

const NAV = [
  { label: "Dashboard", path: "/farm", icon: <Home className="w-5 h-5" /> },
  { label: "My Farm", path: "/farm/register", icon: <PlusCircle className="w-5 h-5" /> },
  { label: "Disease Report", path: "/farm/report", icon: <AlertTriangle className="w-5 h-5" /> },
  { label: "Map View", path: "/farm/map", icon: <Map className="w-5 h-5" /> },
  { label: "Permits", path: "/farm/permits", icon: <FileText className="w-5 h-5" /> },
  { label: "My Profile", path: "/farm/profile", icon: <User className="w-5 h-5" /> },
];

const RISK_DOT: Record<string, string> = {
  low: "bg-green-500", moderate: "bg-yellow-500", high: "bg-orange-500", critical: "bg-red-500"
};

export default function FarmMapView() {
  const api = useApi();
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/map/municipalities").then(setMunicipalities).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout navItems={NAV} role="Farm Owner" roleColor="bg-emerald-600">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Disease Map View</h1>
          <p className="text-slate-500 text-sm mt-1">View disease risk levels across municipalities in Laguna Province.</p>
        </div>

        {/* Risk legend */}
        <div className="flex flex-wrap gap-4 bg-white rounded-2xl border border-slate-200 p-4">
          {["low", "moderate", "high", "critical"].map(r => (
            <div key={r} className="flex items-center gap-2 text-sm">
              <span className={`w-3 h-3 rounded-full ${RISK_DOT[r]}`} />
              <span className="capitalize text-slate-700 font-medium">{r}</span>
            </div>
          ))}
        </div>

        {/* Municipality grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(10)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {municipalities.map((m: any) => (
              <div key={m.municipality} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-slate-900">{m.municipality}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${RISK_DOT[m.risk_level] || "bg-green-500"}`} />
                    <span className="text-xs font-medium capitalize text-slate-600">{m.risk_level || "low"}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-sm font-bold text-slate-900">{m.farm_count}</p>
                    <p className="text-xs text-slate-500">Farms</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-sm font-bold text-slate-900">{Number(m.swine_population || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Swine</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-sm font-bold text-slate-900">{m.recent_reports}</p>
                    <p className="text-xs text-slate-500">Reports</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

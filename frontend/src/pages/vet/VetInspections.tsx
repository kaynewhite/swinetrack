import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { Badge } from "../../components/shared/Badge";
import { useApi } from "../../lib/api";
import { VET_NAV } from "./VetDashboard";
import { ClipboardList, Search, CheckCircle } from "lucide-react";

export default function VetInspections() {
  const api = useApi();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selected, setSelected] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get("/diseases").then(setReports).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (status: "verified" | "resolved") => {
    if (!selected) return;
    setUpdating(true);
    try {
      await api.patch(`/diseases/${selected.id}/status`, { status, notes });
      setReports(r => r.map(rep => rep.id === selected.id ? { ...rep, status } : rep));
      setSelected(null); setNotes("");
    } catch (err) { console.error(err); }
    finally { setUpdating(false); }
  };

  const filtered = reports.filter(r => {
    const matchSearch = !search || r.disease_name.toLowerCase().includes(search.toLowerCase()) || r.farm_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout navItems={VET_NAV} role="Veterinarian" roleColor="bg-violet-600">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Field Inspections</h1>
          <p className="text-slate-500 text-sm mt-1">Review, verify, and update disease case reports.</p>
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
              <h3 className="font-bold text-slate-900 text-lg mb-4">Inspect Report #{selected.id}</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-slate-500">Farm:</span><span className="font-medium">{selected.farm_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Location:</span><span>{selected.municipality}, {selected.barangay}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Disease:</span><span className="font-semibold text-red-700">{selected.disease_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Category:</span><span className="capitalize">{selected.disease_category?.replace(/_/g, " ")}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Affected:</span><span>{selected.affected_count} swine</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Mortality:</span><span>{selected.mortality_count}</span></div>
                {selected.symptoms && (
                  <div><span className="text-slate-500">Symptoms:</span>
                    <p className="mt-1 text-slate-700 text-xs bg-slate-50 p-2 rounded">{selected.symptoms}</p>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Veterinary Assessment / Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Field inspection findings..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none resize-none" />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setSelected(null); setNotes(""); }} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Cancel</button>
                <button onClick={() => handleUpdate("resolved")} disabled={updating} className="px-4 py-2 text-sm text-green-700 bg-green-100 hover:bg-green-200 rounded-xl font-medium disabled:opacity-60">Mark Resolved</button>
                <button onClick={() => handleUpdate("verified")} disabled={updating} className="px-4 py-2 text-sm text-white bg-violet-600 hover:bg-violet-700 rounded-xl font-medium disabled:opacity-60">{updating ? "Saving..." : "Verify"}</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search disease reports..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none bg-white">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No reports matching current filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r: any) => (
                <div key={r.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${r.disease_category === "high_risk_viral" ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-slate-800">{r.disease_name}</p>
                      <Badge color={r.disease_category === "high_risk_viral" ? "red" : r.disease_category === "bacterial" ? "orange" : "blue"}>
                        {r.disease_category?.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{r.farm_name} · {r.municipality}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{r.affected_count} affected · {r.mortality_count} deaths · {new Date(r.reported_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color={r.status === "verified" ? "green" : r.status === "resolved" ? "blue" : "yellow"}>{r.status}</Badge>
                    {r.status === "pending" && (
                      <button onClick={() => setSelected(r)}
                        className="text-xs text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                        Inspect
                      </button>
                    )}
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

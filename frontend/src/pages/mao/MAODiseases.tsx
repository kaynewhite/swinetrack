import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { Badge } from "../../components/shared/Badge";
import { StatCard } from "../../components/shared/StatCard";
import { useApi } from "../../lib/api";
import { MAO_NAV } from "./MAODashboard";
import { AlertTriangle, CheckCircle, XCircle, Clock, Search } from "lucide-react";

export default function MAODiseases() {
  const api = useApi();
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [selected, setSelected] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/diseases"), api.get("/diseases/stats/summary")])
      .then(([d, s]) => { setReports(d); setStats(s); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (status: string) => {
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
    const matchCat = filterCat === "all" || r.disease_category === filterCat;
    return matchSearch && matchStatus && matchCat;
  });

  return (
    <DashboardLayout navItems={MAO_NAV} role="MAO Admin" roleColor="bg-blue-600">
      <div className="space-y-6">
        <div><h1 className="text-2xl font-display font-bold text-slate-900">Disease Case Management</h1>
          <p className="text-slate-500 text-sm mt-1">Review and verify submitted disease reports.</p></div>

        {stats && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Reports" value={stats.total_reports} icon={<AlertTriangle className="w-6 h-6" />} />
            <StatCard label="Pending Review" value={stats.pending} icon={<Clock className="w-6 h-6" />} iconBg="bg-amber-100 text-amber-600" />
            <StatCard label="Verified" value={stats.verified} icon={<CheckCircle className="w-6 h-6" />} iconBg="bg-green-100 text-green-600" />
            <StatCard label="High-Risk Viral" value={stats.high_risk_viral} icon={<XCircle className="w-6 h-6" />} iconBg="bg-red-100 text-red-600" />
          </div>
        )}

        {/* Review Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
              <h3 className="font-bold text-slate-900 text-lg mb-4">Review Report #{selected.id}</h3>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Farm:</span><span className="font-medium">{selected.farm_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Disease:</span><span className="font-medium">{selected.disease_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Category:</span><span className="capitalize">{selected.disease_category?.replace(/_/g, " ")}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Affected:</span><span>{selected.affected_count}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Mortality:</span><span>{selected.mortality_count}</span></div>
                {selected.symptoms && <div><span className="text-slate-500">Symptoms:</span><p className="mt-1 text-slate-700 text-xs bg-slate-50 p-2 rounded">{selected.symptoms}</p></div>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Remarks</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setSelected(null); setNotes(""); }} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Cancel</button>
                <button onClick={() => handleUpdateStatus("rejected")} disabled={updating} className="px-4 py-2 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-xl font-medium disabled:opacity-60">Reject</button>
                <button onClick={() => handleUpdateStatus("verified")} disabled={updating} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium disabled:opacity-60">{updating ? "Saving..." : "Verify"}</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="all">All Categories</option>
              <option value="high_risk_viral">High-Risk Viral</option>
              <option value="bacterial">Bacterial</option>
              <option value="parasitic">Parasitic</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">No reports found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="pb-3 pr-4 font-semibold">Farm</th>
                  <th className="pb-3 pr-4 font-semibold">Disease</th>
                  <th className="pb-3 pr-4 font-semibold">Category</th>
                  <th className="pb-3 pr-4 font-semibold">Affected</th>
                  <th className="pb-3 pr-4 font-semibold">Reported</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-4 font-medium text-slate-800">{r.farm_name}</td>
                      <td className="py-3 pr-4 text-slate-700">{r.disease_name}</td>
                      <td className="py-3 pr-4">
                        <Badge color={r.disease_category === "high_risk_viral" ? "red" : r.disease_category === "bacterial" ? "orange" : "blue"}>
                          {r.disease_category?.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{r.affected_count}</td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">{new Date(r.reported_at).toLocaleDateString()}</td>
                      <td className="py-3 pr-4"><Badge color={r.status === "verified" ? "green" : r.status === "rejected" ? "red" : r.status === "resolved" ? "blue" : "yellow"}>{r.status}</Badge></td>
                      <td className="py-3">
                        {r.status === "pending" && (
                          <button onClick={() => setSelected(r)} className="text-xs text-blue-600 hover:underline font-medium">Review</button>
                        )}
                      </td>
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

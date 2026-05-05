import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { Badge } from "../../components/shared/Badge";
import { StatCard } from "../../components/shared/StatCard";
import { useApi } from "../../lib/api";
import { MAO_NAV } from "./MAODashboard";
import { FileText, CheckCircle, XCircle, Clock, Search } from "lucide-react";

export default function MAOPermits() {
  const api = useApi();
  const [permits, setPermits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selected, setSelected] = useState<any | null>(null);
  const [remarks, setRemarks] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get("/permits").then(setPermits).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleReview = async (status: "approved" | "rejected") => {
    if (!selected) return;
    setUpdating(true);
    try {
      await api.patch(`/permits/${selected.id}/review`, { status, remarks });
      setPermits(p => p.map(permit => permit.id === selected.id ? { ...permit, status } : permit));
      setSelected(null); setRemarks("");
    } catch (err) { console.error(err); }
    finally { setUpdating(false); }
  };

  const filtered = permits.filter(p => {
    const matchSearch = !search || p.farm_name?.toLowerCase().includes(search.toLowerCase()) || p.requester_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pending = permits.filter(p => p.status === "pending").length;
  const approved = permits.filter(p => p.status === "approved").length;
  const rejected = permits.filter(p => p.status === "rejected").length;

  return (
    <DashboardLayout navItems={MAO_NAV} role="MAO Admin" roleColor="bg-blue-600">
      <div className="space-y-6">
        <div><h1 className="text-2xl font-display font-bold text-slate-900">Permit Management</h1>
          <p className="text-slate-500 text-sm mt-1">Review and process meat transport and movement permits.</p></div>

        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard label="Pending Review" value={pending} icon={<Clock className="w-6 h-6" />} iconBg="bg-amber-100 text-amber-600" />
          <StatCard label="Approved" value={approved} icon={<CheckCircle className="w-6 h-6" />} iconBg="bg-green-100 text-green-600" />
          <StatCard label="Rejected" value={rejected} icon={<XCircle className="w-6 h-6" />} iconBg="bg-red-100 text-red-600" />
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
              <h3 className="font-bold text-slate-900 text-lg mb-4">Review Permit #{selected.id}</h3>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Farm:</span><span className="font-medium">{selected.farm_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Requester:</span><span>{selected.requester_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Permit Type:</span><span className="capitalize">{selected.permit_type}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Route:</span><span>{selected.origin} → {selected.destination}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Swine Count:</span><span>{selected.swine_count}</span></div>
                {selected.transport_date && <div className="flex justify-between"><span className="text-slate-500">Transport Date:</span><span>{new Date(selected.transport_date).toLocaleDateString()}</span></div>}
                {selected.purpose && <div><span className="text-slate-500">Purpose:</span><p className="mt-1 text-slate-700 text-xs bg-slate-50 p-2 rounded">{selected.purpose}</p></div>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Remarks (optional)</label>
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setSelected(null); setRemarks(""); }} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Cancel</button>
                <button onClick={() => handleReview("rejected")} disabled={updating} className="px-4 py-2 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-xl font-medium disabled:opacity-60">Reject</button>
                <button onClick={() => handleReview("approved")} disabled={updating} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium disabled:opacity-60">{updating ? "Saving..." : "Approve"}</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search permits..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">No permits found.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((p: any) => (
                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-800 text-sm">{p.farm_name}</p>
                      <Badge color={p.permit_type === "transport" ? "blue" : p.permit_type === "slaughter" ? "red" : "slate"}>{p.permit_type}</Badge>
                    </div>
                    <p className="text-xs text-slate-500">{p.origin} → {p.destination} · {p.swine_count} swine</p>
                    <p className="text-xs text-slate-400 mt-0.5">Requested by {p.requester_name} · {new Date(p.requested_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color={p.status === "approved" ? "green" : p.status === "rejected" ? "red" : "yellow"}>{p.status}</Badge>
                    {p.status === "pending" && (
                      <button onClick={() => setSelected(p)} className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">Review</button>
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

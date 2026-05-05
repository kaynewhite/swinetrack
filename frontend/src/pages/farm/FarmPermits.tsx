import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { Badge } from "../../components/shared/Badge";
import { useApi } from "../../lib/api";
import { MUNICIPALITIES } from "../../lib/constants";
import { Home, AlertTriangle, FileText, Map, User, PlusCircle, Send } from "lucide-react";

const NAV = [
  { label: "Dashboard", path: "/farm", icon: <Home className="w-5 h-5" /> },
  { label: "My Farm", path: "/farm/register", icon: <PlusCircle className="w-5 h-5" /> },
  { label: "Disease Report", path: "/farm/report", icon: <AlertTriangle className="w-5 h-5" /> },
  { label: "Map View", path: "/farm/map", icon: <Map className="w-5 h-5" /> },
  { label: "Permits", path: "/farm/permits", icon: <FileText className="w-5 h-5" /> },
  { label: "My Profile", path: "/farm/profile", icon: <User className="w-5 h-5" /> },
];

export default function FarmPermits() {
  const api = useApi();
  const [farms, setFarms] = useState<any[]>([]);
  const [permits, setPermits] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    farmId: "", permitType: "transport", origin: "", destination: "",
    swineCount: "", purpose: "", transportDate: "",
  });

  useEffect(() => {
    api.get("/farms").then(setFarms).catch(console.error);
    api.get("/permits").then(setPermits).catch(console.error);
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const permit = await api.post("/permits", {
        farmId: parseInt(form.farmId),
        permitType: form.permitType,
        origin: form.origin,
        destination: form.destination,
        swineCount: parseInt(form.swineCount) || 0,
        purpose: form.purpose,
        transportDate: form.transportDate,
      });
      setPermits(p => [permit, ...p]);
      setShowForm(false);
      setMsg({ type: "success", text: "Permit request submitted. MAO will review within 3-5 business days." });
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to submit permit." });
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout navItems={NAV} role="Farm Owner" roleColor="bg-emerald-600">
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Transport Permits</h1>
            <p className="text-slate-500 text-sm mt-1">Request meat movement and transport permits.</p>
          </div>
          <button onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            <Send className="w-4 h-4" /> New Request
          </button>
        </div>

        {msg && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {msg.text}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">New Permit Request</h2>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Farm *</label>
                <select required value={form.farmId} onChange={e => set("farmId", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                  <option value="">Select farm</option>
                  {farms.map(f => <option key={f.id} value={f.id}>{f.farm_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Permit Type *</label>
                <select required value={form.permitType} onChange={e => set("permitType", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                  <option value="transport">Transport</option>
                  <option value="slaughter">Slaughter</option>
                  <option value="movement">Movement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Origin *</label>
                <input required value={form.origin} onChange={e => set("origin", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Origin municipality/address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Destination *</label>
                <input required value={form.destination} onChange={e => set("destination", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Destination address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Swine *</label>
                <input type="number" min="1" required value={form.swineCount} onChange={e => set("swineCount", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Count" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transport Date</label>
                <input type="date" value={form.transportDate} onChange={e => set("transportDate", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Purpose</label>
                <textarea value={form.purpose} onChange={e => set("purpose", e.target.value)} rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  placeholder="Purpose of transport..." />
              </div>
              <div className="sm:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
                  {saving ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">My Permit Requests</h2>
          {permits.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No permit requests yet.</p>
          ) : (
            <div className="space-y-3">
              {permits.map((p: any) => (
                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-800">{p.permit_type.charAt(0).toUpperCase() + p.permit_type.slice(1)} Permit</p>
                    <p className="text-xs text-slate-500">{p.origin} → {p.destination} · {p.swine_count} swine</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(p.requested_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={p.status === "approved" ? "green" : p.status === "rejected" ? "red" : "yellow"}>
                      {p.status}
                    </Badge>
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

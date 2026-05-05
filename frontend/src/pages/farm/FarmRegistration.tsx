import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { useApi } from "../../lib/api";
import { MUNICIPALITIES } from "../../lib/constants";
import { Home, AlertTriangle, FileText, Map, User, PlusCircle, Save, Trash2 } from "lucide-react";

const NAV = [
  { label: "Dashboard", path: "/farm", icon: <Home className="w-5 h-5" /> },
  { label: "My Farm", path: "/farm/register", icon: <PlusCircle className="w-5 h-5" /> },
  { label: "Disease Report", path: "/farm/report", icon: <AlertTriangle className="w-5 h-5" /> },
  { label: "Map View", path: "/farm/map", icon: <Map className="w-5 h-5" /> },
  { label: "Permits", path: "/farm/permits", icon: <FileText className="w-5 h-5" /> },
  { label: "My Profile", path: "/farm/profile", icon: <User className="w-5 h-5" /> },
];

export default function FarmRegistration() {
  const api = useApi();
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    farmName: "", farmType: "backyard", municipality: "", barangay: "",
    address: "", latitude: "", longitude: "", totalSwine: "",
  });

  useEffect(() => {
    api.get("/farms").then(setFarms).catch(console.error).finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const farm = await api.post("/farms", {
        farmName: form.farmName, farmType: form.farmType,
        municipality: form.municipality, barangay: form.barangay,
        address: form.address,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        totalSwine: parseInt(form.totalSwine) || 0,
      });
      setFarms(f => [farm, ...f]);
      setForm({ farmName: "", farmType: "backyard", municipality: "", barangay: "", address: "", latitude: "", longitude: "", totalSwine: "" });
      setMsg({ type: "success", text: "Farm registered successfully!" });
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to register farm." });
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout navItems={NAV} role="Farm Owner" roleColor="bg-emerald-600">
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Farm Registration</h1>
          <p className="text-slate-500 text-sm mt-1">Register your backyard or commercial swine farm.</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-5">Register New Farm</h2>
          {msg && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {msg.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Farm Name *</label>
              <input required value={form.farmName} onChange={e => set("farmName", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                placeholder="e.g. Santos Family Farm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Farm Type *</label>
              <select required value={form.farmType} onChange={e => set("farmType", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                <option value="backyard">Backyard</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Municipality *</label>
              <select required value={form.municipality} onChange={e => set("municipality", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                <option value="">Select municipality</option>
                {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Barangay *</label>
              <input required value={form.barangay} onChange={e => set("barangay", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="Barangay name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Swine</label>
              <input type="number" min="0" value={form.totalSwine} onChange={e => set("totalSwine", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="Number of swine" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Address *</label>
              <input required value={form.address} onChange={e => set("address", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="Street address" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Latitude (optional)</label>
              <input type="number" step="any" value={form.latitude} onChange={e => set("latitude", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="e.g. 14.1691" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Longitude (optional)</label>
              <input type="number" step="any" value={form.longitude} onChange={e => set("longitude", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="e.g. 121.2172" />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Register Farm"}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Farms */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Registered Farms</h2>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : farms.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No farms registered yet.</p>
          ) : (
            <div className="space-y-3">
              {farms.map((farm: any) => (
                <div key={farm.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-800">{farm.farm_name}</p>
                    <p className="text-xs text-slate-500">{farm.farm_type} · {farm.municipality}, {farm.barangay}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{farm.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{Number(farm.total_swine).toLocaleString()}</p>
                    <p className="text-xs text-slate-400">swine</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${farm.status === "active" ? "bg-green-100 text-green-700" : farm.status === "quarantined" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                      {farm.status}
                    </span>
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

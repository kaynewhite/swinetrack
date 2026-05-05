import { useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { useApi } from "../../lib/api";
import { useUser } from "@clerk/clerk-react";
import { MUNICIPALITIES } from "../../lib/constants";
import { Home, AlertTriangle, FileText, Map, User, PlusCircle, Save } from "lucide-react";

const NAV = [
  { label: "Dashboard", path: "/farm", icon: <Home className="w-5 h-5" /> },
  { label: "My Farm", path: "/farm/register", icon: <PlusCircle className="w-5 h-5" /> },
  { label: "Disease Report", path: "/farm/report", icon: <AlertTriangle className="w-5 h-5" /> },
  { label: "Map View", path: "/farm/map", icon: <Map className="w-5 h-5" /> },
  { label: "Permits", path: "/farm/permits", icon: <FileText className="w-5 h-5" /> },
  { label: "My Profile", path: "/farm/profile", icon: <User className="w-5 h-5" /> },
];

export default function FarmProfile() {
  const { user } = useUser();
  const api = useApi();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({ municipality: "", contactNumber: "" });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await api.post("/users/sync", {
        email: user?.emailAddresses[0]?.emailAddress,
        fullName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        role: "farm_owner",
        municipality: form.municipality,
        contactNumber: form.contactNumber,
      });
      setMsg({ type: "success", text: "Profile synced successfully!" });
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout navItems={NAV} role="Farm Owner" roleColor="bg-emerald-600">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your account and sync your profile with SwineTrack.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-2xl font-bold">
              {user?.firstName?.[0] || "U"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.firstName} {user?.lastName}</h2>
              <p className="text-slate-500 text-sm">{user?.emailAddresses?.[0]?.emailAddress}</p>
              <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Farm Owner</span>
            </div>
          </div>

          {msg && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSync} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Municipality</label>
              <select value={form.municipality} onChange={e => set("municipality", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                <option value="">Select municipality</option>
                {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
              <input value={form.contactNumber} onChange={e => set("contactNumber", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="+63 9XX XXX XXXX" />
            </div>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Sync Profile"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

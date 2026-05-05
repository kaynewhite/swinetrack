import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { Badge } from "../../components/shared/Badge";
import { useApi } from "../../lib/api";
import { DISEASES_HIGH_RISK, DISEASES_BACTERIAL, DISEASES_PARASITIC } from "../../lib/constants";
import { Home, AlertTriangle, FileText, Map, User, PlusCircle, Send } from "lucide-react";

const NAV = [
  { label: "Dashboard", path: "/farm", icon: <Home className="w-5 h-5" /> },
  { label: "My Farm", path: "/farm/register", icon: <PlusCircle className="w-5 h-5" /> },
  { label: "Disease Report", path: "/farm/report", icon: <AlertTriangle className="w-5 h-5" /> },
  { label: "Map View", path: "/farm/map", icon: <Map className="w-5 h-5" /> },
  { label: "Permits", path: "/farm/permits", icon: <FileText className="w-5 h-5" /> },
  { label: "My Profile", path: "/farm/profile", icon: <User className="w-5 h-5" /> },
];

const CATEGORY_DISEASES: Record<string, string[]> = {
  high_risk_viral: DISEASES_HIGH_RISK,
  bacterial: DISEASES_BACTERIAL,
  parasitic: DISEASES_PARASITIC,
};

export default function FarmDiseaseReport() {
  const api = useApi();
  const [farms, setFarms] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    farmId: "", diseaseCategory: "high_risk_viral", diseaseName: "",
    affectedCount: "", mortalityCount: "", symptoms: "", notes: "",
  });

  useEffect(() => {
    api.get("/farms").then(setFarms).catch(console.error);
    api.get("/diseases").then(setReports).catch(console.error);
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const report = await api.post("/diseases", {
        farmId: parseInt(form.farmId),
        diseaseCategory: form.diseaseCategory,
        diseaseName: form.diseaseName,
        affectedCount: parseInt(form.affectedCount) || 0,
        mortalityCount: parseInt(form.mortalityCount) || 0,
        symptoms: form.symptoms,
        notes: form.notes,
      });
      setReports(r => [report, ...r]);
      setForm({ farmId: "", diseaseCategory: "high_risk_viral", diseaseName: "", affectedCount: "", mortalityCount: "", symptoms: "", notes: "" });
      setMsg({ type: "success", text: "Disease report submitted successfully. MAO will review shortly." });
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to submit report." });
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout navItems={NAV} role="Farm Owner" roleColor="bg-emerald-600">
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Disease Reporting</h1>
          <p className="text-slate-500 text-sm mt-1">Report any suspected disease in your swine herd immediately.</p>
        </div>

        {/* High risk banner */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">High-Risk Disease Alert</p>
            <p className="text-red-600 text-xs mt-0.5">For suspected African Swine Fever, PRRS, or Classical Swine Fever, report immediately and isolate affected animals. Contact your local MAO.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-5">Submit Disease Report</h2>
          {msg && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {msg.text}
            </div>
          )}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Disease Category *</label>
              <select required value={form.diseaseCategory} onChange={e => { set("diseaseCategory", e.target.value); set("diseaseName", ""); }}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                <option value="high_risk_viral">High-Risk Viral</option>
                <option value="bacterial">Bacterial</option>
                <option value="parasitic">Parasitic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Disease Name *</label>
              <select required value={form.diseaseName} onChange={e => set("diseaseName", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                <option value="">Select disease</option>
                {(CATEGORY_DISEASES[form.diseaseCategory] || []).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Affected Count *</label>
              <input type="number" min="0" required value={form.affectedCount} onChange={e => set("affectedCount", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="Number of affected swine" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mortality Count</label>
              <input type="number" min="0" value={form.mortalityCount} onChange={e => set("mortalityCount", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="Number of deaths" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Symptoms Observed</label>
              <textarea value={form.symptoms} onChange={e => set("symptoms", e.target.value)} rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                placeholder="Describe observed symptoms..." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
              <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                placeholder="Any additional information..." />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                <Send className="w-4 h-4" /> {saving ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>

        {/* Past Reports */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">My Disease Reports</h2>
          {reports.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No reports submitted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="pb-3 pr-4 font-semibold">Farm</th>
                  <th className="pb-3 pr-4 font-semibold">Disease</th>
                  <th className="pb-3 pr-4 font-semibold">Affected</th>
                  <th className="pb-3 pr-4 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {reports.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-4 font-medium text-slate-800">{r.farm_name}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.disease_name}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.affected_count}</td>
                      <td className="py-3 pr-4 text-slate-500">{new Date(r.reported_at).toLocaleDateString()}</td>
                      <td className="py-3">
                        <Badge color={r.status === "verified" ? "green" : r.status === "rejected" ? "red" : "yellow"}>{r.status}</Badge>
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

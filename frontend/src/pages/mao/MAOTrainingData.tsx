import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { useApi } from "../../lib/api";
import { MAO_NAV } from "./MAODashboard";
import { Database, Plus, Trash2, Save, Info } from "lucide-react";
import { MUNICIPALITIES, DISEASES_HIGH_RISK, DISEASES_BACTERIAL, DISEASES_PARASITIC } from "../../lib/constants";

const ALL_DISEASES = [...DISEASES_HIGH_RISK, ...DISEASES_BACTERIAL, ...DISEASES_PARASITIC];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function MAOTrainingData() {
  const api = useApi();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    municipality: "", month: "1", year: new Date().getFullYear().toString(),
    diseaseName: "", caseCount: "", mortalityCount: "", farmCount: "", swinePopulation: "",
  });

  const load = () => {
    setLoading(true);
    api.get("/analytics/training-data").then(setData).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await api.post("/analytics/training-data", {
        municipality: form.municipality,
        month: parseInt(form.month),
        year: parseInt(form.year),
        diseaseName: form.diseaseName,
        caseCount: parseInt(form.caseCount) || 0,
        mortalityCount: parseInt(form.mortalityCount) || 0,
        farmCount: parseInt(form.farmCount) || 0,
        swinePopulation: parseInt(form.swinePopulation) || 0,
      });
      setMsg({ type: "success", text: "Training data entry saved!" });
      load();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to save." });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await api.del(`/analytics/training-data/${id}`);
      setData(d => d.filter(row => row.id !== id));
    } catch (err) { console.error(err); }
    finally { setDeleting(null); }
  };

  return (
    <DashboardLayout navItems={MAO_NAV} role="MAO Admin" roleColor="bg-blue-600">
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Model Training Data</h1>
          <p className="text-slate-500 text-sm mt-1">Enter historical disease case data to feed the ARIMA and Random Forest prediction models.</p>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-800 text-sm">About Training Data</p>
            <p className="text-blue-600 text-xs mt-1 leading-relaxed">
              This is where you input historical disease case records gathered from your interviews and field data. The more months of data you enter per municipality and disease, the more accurate the ARIMA + Random Forest models will be. After adding data, go to the Prescriptive System page and click "Run New Forecast" to generate predictions.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" /> Add Historical Data Entry
          </h2>
          {msg && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {msg.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Municipality *</label>
              <select required value={form.municipality} onChange={e => set("municipality", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="">Select municipality</option>
                {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Month *</label>
              <select required value={form.month} onChange={e => set("month", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year *</label>
              <input type="number" required min="2018" max="2030" value={form.year} onChange={e => set("year", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Disease Name *</label>
              <select required value={form.diseaseName} onChange={e => set("diseaseName", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="">Select disease</option>
                <optgroup label="High-Risk Viral">{DISEASES_HIGH_RISK.map(d => <option key={d} value={d}>{d}</option>)}</optgroup>
                <optgroup label="Bacterial">{DISEASES_BACTERIAL.map(d => <option key={d} value={d}>{d}</option>)}</optgroup>
                <optgroup label="Parasitic">{DISEASES_PARASITIC.map(d => <option key={d} value={d}>{d}</option>)}</optgroup>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Case Count *</label>
              <input type="number" min="0" required value={form.caseCount} onChange={e => set("caseCount", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Number of cases" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mortality Count</label>
              <input type="number" min="0" value={form.mortalityCount} onChange={e => set("mortalityCount", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Deaths" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Farm Count</label>
              <input type="number" min="0" value={form.farmCount} onChange={e => set("farmCount", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Farms in municipality" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Swine Population</label>
              <input type="number" min="0" value={form.swinePopulation} onChange={e => set("swinePopulation", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Total swine in area" />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </form>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" /> Training Data Records ({data.length})
          </h2>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : data.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Database className="w-12 h-12 mx-auto mb-3 opacity-25" />
              <p className="text-sm">No training data entered yet.</p>
              <p className="text-xs mt-1">Add historical case records above to enable AI forecasting.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="pb-3 pr-3 font-semibold">Municipality</th>
                  <th className="pb-3 pr-3 font-semibold">Period</th>
                  <th className="pb-3 pr-3 font-semibold">Disease</th>
                  <th className="pb-3 pr-3 font-semibold">Cases</th>
                  <th className="pb-3 pr-3 font-semibold">Mortality</th>
                  <th className="pb-3 pr-3 font-semibold">Farms</th>
                  <th className="pb-3 pr-3 font-semibold">Population</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {data.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-3 font-medium text-slate-800">{row.municipality}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{MONTHS[row.month - 1]?.slice(0, 3)} {row.year}</td>
                      <td className="py-2.5 pr-3 text-slate-600 text-xs max-w-[150px] truncate">{row.disease_name}</td>
                      <td className="py-2.5 pr-3 font-bold text-slate-900">{row.case_count}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{row.mortality_count}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{row.farm_count}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{Number(row.swine_population).toLocaleString()}</td>
                      <td className="py-2.5">
                        <button onClick={() => handleDelete(row.id)} disabled={deleting === row.id}
                          className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-40">
                          <Trash2 className="w-4 h-4" />
                        </button>
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

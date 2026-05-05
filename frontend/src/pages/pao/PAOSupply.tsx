import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { useApi } from "../../lib/api";
import { PAO_NAV } from "./PAODashboard";
import { Package, Plus, Save } from "lucide-react";
import { MUNICIPALITIES } from "../../lib/constants";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function PAOSupply() {
  const api = useApi();
  const [supplyData, setSupplyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    municipality: "", month: "1", year: new Date().getFullYear().toString(),
    totalSwinePopulation: "", swineSlaughtered: "", swineTransported: "",
  });

  useEffect(() => {
    api.get("/analytics/supply").then(setSupplyData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await api.post("/analytics/supply", {
        municipality: form.municipality,
        month: parseInt(form.month),
        year: parseInt(form.year),
        totalSwinePopulation: parseInt(form.totalSwinePopulation) || 0,
        swineSlaughtered: parseInt(form.swineSlaughtered) || 0,
        swineTransported: parseInt(form.swineTransported) || 0,
      });
      setMsg({ type: "success", text: "Supply data saved!" });
      const updated = await api.get("/analytics/supply");
      setSupplyData(updated);
      setShowForm(false);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally { setSaving(false); }
  };

  // Aggregate for chart (last 6 months)
  const chartData = supplyData.slice(0, 6).map((d: any) => ({
    period: `${MONTHS[d.month - 1]} ${d.year}`,
    population: d.total_swine_population,
    slaughtered: d.swine_slaughtered,
    transported: d.swine_transported,
  })).reverse();

  return (
    <DashboardLayout navItems={PAO_NAV} role="PAO Monitor" roleColor="bg-slate-700">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Supply Monitoring</h1>
            <p className="text-slate-500 text-sm mt-1">Track swine population, slaughter, and transport data province-wide.</p>
          </div>
          <button onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Add Supply Data
          </button>
        </div>

        {msg && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {msg.text}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Add Supply Record</h2>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Municipality *</label>
                <select required value={form.municipality} onChange={e => set("municipality", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-slate-500 outline-none bg-white">
                  <option value="">Select</option>
                  {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Month *</label>
                <select required value={form.month} onChange={e => set("month", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-slate-500 outline-none bg-white">
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year *</label>
                <input type="number" required min="2018" max="2030" value={form.year} onChange={e => set("year", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-slate-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Swine Population</label>
                <input type="number" min="0" value={form.totalSwinePopulation} onChange={e => set("totalSwinePopulation", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-slate-500 outline-none" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Swine Slaughtered</label>
                <input type="number" min="0" value={form.swineSlaughtered} onChange={e => set("swineSlaughtered", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-slate-500 outline-none" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Swine Transported</label>
                <input type="number" min="0" value={form.swineTransported} onChange={e => set("swineTransported", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-slate-500 outline-none" placeholder="0" />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
                  <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Supply Trend</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="population" name="Population" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="slaughtered" name="Slaughtered" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="transported" name="Transported" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Supply Records</h2>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : supplyData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No supply data yet. Add your first record above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="pb-3 pr-4 font-semibold">Municipality</th>
                  <th className="pb-3 pr-4 font-semibold">Period</th>
                  <th className="pb-3 pr-4 font-semibold">Population</th>
                  <th className="pb-3 pr-4 font-semibold">Slaughtered</th>
                  <th className="pb-3 font-semibold">Transported</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {supplyData.map((d: any) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-4 font-medium text-slate-800">{d.municipality}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{MONTHS[d.month - 1]} {d.year}</td>
                      <td className="py-2.5 pr-4 text-slate-700">{Number(d.total_swine_population).toLocaleString()}</td>
                      <td className="py-2.5 pr-4 text-red-600 font-medium">{Number(d.swine_slaughtered).toLocaleString()}</td>
                      <td className="py-2.5 text-blue-600 font-medium">{Number(d.swine_transported).toLocaleString()}</td>
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

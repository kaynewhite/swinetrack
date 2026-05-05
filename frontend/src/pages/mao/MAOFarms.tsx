import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { Badge } from "../../components/shared/Badge";
import { StatCard } from "../../components/shared/StatCard";
import { useApi } from "../../lib/api";
import { MAO_NAV } from "./MAODashboard";
import { Users, Home, TrendingUp, AlertTriangle, Search, Filter } from "lucide-react";

export default function MAOFarms() {
  const api = useApi();
  const [farms, setFarms] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    Promise.all([api.get("/farms"), api.get("/farms/stats/summary")])
      .then(([f, s]) => { setFarms(f); setStats(s); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (farmId: number, status: string) => {
    try {
      await api.patch(`/farms/${farmId}`, { status });
      setFarms(f => f.map(farm => farm.id === farmId ? { ...farm, status } : farm));
    } catch (err) { console.error(err); }
  };

  const filtered = farms.filter(f => {
    const matchSearch = !search || f.farm_name.toLowerCase().includes(search.toLowerCase()) || f.municipality.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || f.farm_type === filterType;
    const matchStatus = filterStatus === "all" || f.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <DashboardLayout navItems={MAO_NAV} role="MAO Admin" roleColor="bg-blue-600">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Farm Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor all registered farms in your municipality.</p>
        </div>

        {stats && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Farms" value={stats.total_farms} icon={<Home className="w-6 h-6" />} />
            <StatCard label="Total Swine" value={Number(stats.total_swine || 0).toLocaleString()} icon={<TrendingUp className="w-6 h-6" />} iconBg="bg-blue-100 text-blue-600" />
            <StatCard label="Commercial" value={stats.commercial_farms} icon={<Users className="w-6 h-6" />} iconBg="bg-violet-100 text-violet-600" />
            <StatCard label="Quarantined" value={stats.quarantined_farms} icon={<AlertTriangle className="w-6 h-6" />} iconBg="bg-red-100 text-red-600" />
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search farms..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="all">All Types</option>
              <option value="backyard">Backyard</option>
              <option value="commercial">Commercial</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="quarantined">Quarantined</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">No farms found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="pb-3 pr-4 font-semibold">Farm</th>
                  <th className="pb-3 pr-4 font-semibold">Owner</th>
                  <th className="pb-3 pr-4 font-semibold">Location</th>
                  <th className="pb-3 pr-4 font-semibold">Type</th>
                  <th className="pb-3 pr-4 font-semibold">Swine</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((f: any) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-4 font-semibold text-slate-800">{f.farm_name}</td>
                      <td className="py-3 pr-4 text-slate-600 text-xs">{f.owner_name}</td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">{f.municipality}, {f.barangay}</td>
                      <td className="py-3 pr-4"><Badge color={f.farm_type === "commercial" ? "blue" : "slate"}>{f.farm_type}</Badge></td>
                      <td className="py-3 pr-4 font-medium">{Number(f.total_swine).toLocaleString()}</td>
                      <td className="py-3 pr-4"><Badge color={f.status === "active" ? "green" : f.status === "quarantined" ? "red" : "slate"}>{f.status}</Badge></td>
                      <td className="py-3">
                        <select value={f.status} onChange={e => handleStatusChange(f.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                          <option value="active">Set Active</option>
                          <option value="quarantined">Quarantine</option>
                          <option value="inactive">Deactivate</option>
                        </select>
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

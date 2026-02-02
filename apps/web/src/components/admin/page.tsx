import { 
  DollarSign, 
  Ticket, 
  Users,
  Calendar
} from "lucide-react";
import { StatsCard, SalesChart } from "@/components/admin/DashboardWidgets";
import LiveMonitor from "@/components/admin/LiveMonitor";
import { Button } from "@/components/ui/Button";

export default function AdminDashboard() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Title Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
          <p className="text-slate-500 dark:text-slate-400">Real-time monitoring of global event performance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
             <Calendar className="w-4 h-4" /> Last 24 Hours
          </Button>
          <Button variant="primary" size="sm">
             Generate Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Total Revenue" 
          value="$1,245,000" 
          trend="+12.4%" 
          icon={DollarSign} 
        />
        <StatsCard 
          title="Active Bookings" 
          value="4,502" 
          trend="+5.2%" 
          icon={Ticket} 
        />
        <StatsCard 
          title="Concurrent Users" 
          value="842" 
          trend="Live" 
          icon={Users}
          colorClass="text-emerald-500 animate-pulse"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
           <SalesChart />
        </div>
        <div className="xl:col-span-1">
           <LiveMonitor />
        </div>
      </div>

      {/* Performance Table */}
      <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold">Active Event Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Event Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Inventory</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
              {[
                { name: "Synth-Wave Night 2024", status: "SELLING FAST", sold: 452, total: 500, rev: "$71,240", color: "text-emerald-500 bg-emerald-500/10" },
                { name: "AI Tech Expo - San Francisco", status: "ACTIVE", sold: 1240, total: 3000, rev: "$345,120", color: "text-blue-500 bg-blue-500/10" },
                { name: "Championship Finals 2024", status: "ON HOLD", sold: 5000, total: 5000, rev: "$1,200,000", color: "text-amber-500 bg-amber-500/10" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{row.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.color}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-mono font-bold">{row.sold} / {row.total}</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-2">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${(row.sold / row.total) * 100}%` }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold">{row.rev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
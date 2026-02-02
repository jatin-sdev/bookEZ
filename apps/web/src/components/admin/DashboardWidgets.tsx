import { 
  DollarSign, 
  Ticket, 
  Users, 
  TrendingUp, 
  Activity 
} from "lucide-react";

export function StatsCard({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  colorClass = "text-primary" 
}: { 
  title: string; 
  value: string; 
  trend: string; 
  icon: any;
  colorClass?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex justify-between items-start">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <div className="flex items-center gap-1.5 mt-1">
        <TrendingUp className="w-4 h-4 text-emerald-500" />
        <p className="text-emerald-500 text-sm font-bold">
          {trend} <span className="text-slate-400 font-normal ml-1">vs yesterday</span>
        </p>
      </div>
    </div>
  );
}

export function SalesChart() {
  return (
    <div className="flex flex-col gap-6 p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm h-full">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Sales Velocity</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500 text-sm">Throughput: <span className="text-slate-900 dark:text-white font-semibold">142 tickets/min</span></p>
            <span className="text-emerald-500 text-xs font-bold">+15%</span>
          </div>
        </div>
      </div>
      
      {/* SVG Chart Visualization */}
      <div className="h-[300px] w-full relative pt-4">
        <svg className="w-full h-full" viewBox="0 0 478 150" preserveAspectRatio="none">
          <defs>
            <linearGradient id="salesGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#137fec" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#137fec" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path 
            d="M0 109C18 109 18 21 36 21C54 21 54 41 72 41C90 41 90 93 108 93C127 93 127 33 145 33C163 33 163 101 181 101C199 101 199 61 217 61C236 61 236 45 254 45C272 45 272 121 290 121C308 121 308 149 326 149C344 149 344 1 363 1C381 1 381 81 399 81C417 81 417 129 435 129C453 129 453 25 472 25V150H0V109Z" 
            fill="url(#salesGradient)" 
          />
          <path 
            d="M0 109C18 109 18 21 36 21C54 21 54 41 72 41C90 41 90 93 108 93C127 93 127 33 145 33C163 33 163 101 181 101C199 101 199 61 217 61C236 61 236 45 254 45C272 45 272 121 290 121C308 121 308 149 326 149C344 149 344 1 363 1C381 1 381 81 399 81C417 81 417 129 435 129C453 129 453 25 472 25" 
            stroke="#137fec" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" 
          />
        </svg>
        
        {/* Grid Lines Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 py-4">
            {[1,2,3,4].map(i => <div key={i} className="w-full border-t border-slate-400" />)}
        </div>
      </div>
    </div>
  );
}
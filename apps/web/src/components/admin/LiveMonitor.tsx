import { Radio } from "lucide-react";

const MOCK_TRANSACTIONS = [
    { id: 1, user: "Alex Thompson", amount: "$156.00", event: "Synth-Wave Night 2024", time: "2s ago" },
    { id: 2, user: "Sarah Jenkins", amount: "$89.50", event: "AI Tech Expo - VIP", time: "15s ago" },
    { id: 3, user: "Marcus Chen", amount: "$210.00", event: "Global Sports Arena", time: "1m ago" },
    { id: 4, user: "Elena Rodriguez", amount: "$45.00", event: "Indie Film Festival", time: "3m ago" },
];

export default function LiveMonitor() {
  return (
    <div className="flex flex-col rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-full">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-base font-bold flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary animate-pulse" />
          Live Booking Monitor
        </h3>
        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded uppercase">Live Feed</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[400px]">
        {MOCK_TRANSACTIONS.map((tx) => (
          <div key={tx.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:border-primary/30 border border-transparent transition-all">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 font-bold text-primary text-xs">
                {tx.user.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-2">
                <p className="text-sm font-bold truncate">{tx.user}</p>
                <p className="text-sm font-bold text-primary">{tx.amount}</p>
              </div>
              <p className="text-xs text-slate-500 truncate">{tx.event}</p>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">{tx.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Zap, AlertCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PricingRule {
  id: number;
  name: string;
  trigger: string;
  action: string;
  status: "ACTIVE" | "PAUSED";
}

export default function PricingRulesPage() {
  const [rules, setRules] = useState<PricingRule[]>([
    { id: 1, name: "Flash Sale Surge", trigger: "Demand > 80%", action: "Increase 15%", status: "ACTIVE" },
    { id: 2, name: "Last Minute Drop", trigger: "Time < 24h & Inv > 50%", action: "Decrease 20%", status: "PAUSED" },
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <Zap className="w-6 h-6 text-yellow-500" /> Dynamic Pricing Engine
           </h2>
           <p className="text-slate-500 mt-1">Configure AI-driven price adjustments based on real-time demand.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Rule
        </Button>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/50 p-4 rounded-xl flex items-start gap-3">
         <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
         <div>
            <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-400">Automated Pricing Active</h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
              Changes to these rules will affect live events immediately. The AI model updates prices every 60 seconds.
            </p>
         </div>
      </div>

      {/* Rules Grid */}
      <div className="grid gap-4">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between group">
             <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <h3 className="font-bold text-lg text-slate-900 dark:text-white">{rule.name}</h3>
                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rule.status === "ACTIVE" 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                   }`}>
                      {rule.status}
                   </span>
                </div>
                <div className="flex gap-6 text-sm">
                   <p className="text-slate-500">If: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{rule.trigger}</span></p>
                   <p className="text-slate-500">Then: <span className="font-mono font-bold text-primary">{rule.action}</span></p>
                </div>
             </div>
             
             <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                   <Trash2 className="w-4 h-4" />
                </Button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function FlashSaleBanner() {
  return (
    <section className="mb-16 px-4 md:px-10">
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 fill-current" /> Flash Sale Live Soon
            </div>
            <h2 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">Summer Fest 2024: Main Stage</h2>
            <p className="text-slate-500 dark:text-[#9dabb9]">Only 500 Early Bird passes remaining. Get your notification ready.</p>
          </div>

          <div className="flex gap-4">
            {['02', '12', '45', '18'].map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-xl bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/30 shadow-glow">
                  <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{val}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400">{['Days', 'Hours', 'Mins', 'Secs'][i]}</span>
              </div>
            ))}
          </div>

          <Button variant="outline" size="lg" className="w-full lg:w-auto font-black">
            Remind Me
          </Button>
        </div>
      </div>
    </section>
  );
}
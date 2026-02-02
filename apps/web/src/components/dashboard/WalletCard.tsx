import { Wallet, Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function WalletCard() {
  return (
    <div className="bg-gradient-to-br from-primary to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="space-y-1">
          <p className="text-blue-100 text-sm font-medium flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Wallet Balance
          </p>
          <h4 className="text-4xl font-black tracking-tight">$2,450.00</h4>
        </div>
      </div>

      <div className="flex gap-3 relative z-10">
        <Button 
          variant="secondary" 
          className="flex-1 bg-white text-primary hover:bg-blue-50 border-none font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Top Up
        </Button>
        <Button 
          variant="secondary" 
          className="flex-1 bg-blue-600/30 hover:bg-blue-600/50 border-none text-white font-bold"
        >
          <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
        </Button>
      </div>
    </div>
  );
}
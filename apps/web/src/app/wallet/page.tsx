"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wallet as WalletIcon, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiRequest } from "@/lib/api";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  createdAt: string;
}

interface WalletData {
  balance: number;
  totalSpent: number;
  totalRefunds: number;
  pending: number;
}

export default function WalletPage() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchWalletData = async () => {
      // Check if user is logged in
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login?redirect=/wallet');
        return;
      }

      try {
        const query = `
          query GetWalletData {
            myWallet {
              balance
              totalSpent
              totalRefunds
              pending
            }
            myTransactions(limit: 10) {
              id
              type
              amount
              description
              createdAt
            }
          }
        `;
        
        const res = await apiRequest<{ 
          data: { 
            myWallet: WalletData;
            myTransactions: Transaction[];
          } 
        }>('/graphql', {
          method: 'POST',
          body: JSON.stringify({ query })
        });
        
        setWalletData(res.data.myWallet);
        setTransactions(res.data.myTransactions);
      } catch (err: any) {
        console.error('Failed to fetch wallet data:', err);
        setError(err.message || 'Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">Failed to load wallet</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 transition-all">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Wallet
            </h1>
            <p className="text-slate-400 mt-0.5 text-sm">
              Manage your balance and transaction history
            </p>
          </div>

          {/* Balance Card */}
          {/* <div className="bg-gradient-to-br from-primary to-primary-dark p-6 rounded-xl text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-2">Available Balance</p>
                <h2 className="text-4xl font-black tracking-tight">
                  ₹{walletData?.balance.toFixed(2) ?? '0.00'}
                </h2>
              </div>
              <WalletIcon className="w-12 h-12 text-white/20" />
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                Top Up
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                Withdraw
              </Button>
            </div>
          </div> */}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{walletData?.totalSpent.toFixed(2) ?? '0.00'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Refunds</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{walletData?.totalRefunds.toFixed(2) ?? '0.00'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{walletData?.pending.toFixed(2) ?? '0.00'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <WalletIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </div>

            {/* New Dynamic Component: Spending Insights */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
               <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Avg. Transaction</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{transactions.length > 0 
                       ? (transactions.reduce((acc, t) => acc + t.amount, 0) / transactions.length).toFixed(2) 
                       : '0.00'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
               </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-slate-900 rounded-xl border border-slate-700">
            <div className="px-5 py-3 border-b border-slate-700 bg-slate-800/30">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Transaction History</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {transactions.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No transactions yet
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === "credit"
                          ? "bg-green-900/20"
                          : "bg-red-900/20"
                      }`}>
                        {transaction.type === "credit" ? (
                          <ArrowDownRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-slate-400">
                          {new Date(parseInt(transaction.createdAt)).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={`text-base font-bold ${
                      transaction.type === "credit"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

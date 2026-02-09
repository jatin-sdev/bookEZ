'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell, AreaChart, Area
} from 'recharts';
import { ArrowLeft, Flame, TrendingUp, DollarSign, Activity, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface HotEventStat {
  eventId: string;
  eventName: string;
  venueName: string;
  hotScore: number;
  bookingRate: number;
  viewRate: number;
  fillRate: number;
  status: string;
}

interface PricingStat {
  eventId: string;
  eventName: string;
  basePrice: number;
  currentMultiplier: number;
  bookingRateByHour: number;
  projectedRevenue: number;
}

interface SalesStat {
    date: string;
    revenue: number;
    tickets: number;
}

interface AnalyticsData {
  hotEvents: HotEventStat[];
  pricingStats: PricingStat[];
  totalSales: SalesStat[];
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly' | 'custom'>('weekly');
  const [customDate, setCustomDate] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(() => fetchAnalytics(), 30000);
    return () => clearInterval(interval);
  }, [viewMode, customDate]); 

  const fetchAnalytics = async () => {
    try {
        let endDate = new Date();
        let startDate = new Date();
        
        if (viewMode === 'weekly') {
            startDate.setDate(endDate.getDate() - 7);
        } else if (viewMode === 'monthly') {
            startDate.setDate(endDate.getDate() - 30);
        } else if (viewMode === 'custom' && customDate.start && customDate.end) {
            startDate = new Date(customDate.start);
            endDate = new Date(customDate.end);
        }

      const query = `
        query GetAdminAnalytics($startDate: String, $endDate: String) {
          adminAnalytics {
            hotEvents {
              eventId
              eventName
              venueName
              hotScore
              bookingRate
              viewRate
              fillRate
              status
            }
            pricingStats {
              eventId
              eventName
              basePrice
              currentMultiplier
              bookingRateByHour
              projectedRevenue
            }
            totalSales(startDate: $startDate, endDate: $endDate) {
                date
                revenue
                tickets
            }
          }
        }
      `;
      const res = await apiRequest<{ data: { adminAnalytics: AnalyticsData } }>('/graphql', {
        method: 'POST',
        body: JSON.stringify({ 
            query,
            variables: {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            }
        }),
      });

      if (res.data?.adminAnalytics) {
        setData(res.data.adminAnalytics);
      }
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      if (!data) setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
     return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
           <Activity className="w-8 h-8 animate-spin mr-2" /> Loading Analytics...
        </div>
     );
  }

  if (error) {
    const isForbidden = error.toLowerCase().includes('forbidden') || error.toLowerCase().includes('admin access');
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
                {isForbidden ? 'Access Denied' : 'Dashboard Error'}
            </h2>
            <p className="text-slate-400 mb-6 text-sm">
                {isForbidden 
                    ? "You don't have permission to view this secure dashboard. Please log in with an administrator account." 
                    : error
                }
            </p>
            <div className="flex flex-col gap-3">
                {isForbidden && (
                    <Link href="/login">
                        <Button className="w-full bg-slate-800 hover:bg-slate-700">
                            Switch Account
                        </Button>
                    </Link>
                )}
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry Connection
                </Button>
                <Link href="/admin">
                    <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-300">
                        Back to Admin Panel
                    </Button>
                </Link>
            </div>
          </div>
      </div>
   );
  }

  // Helpers for Charts
  const scatterData = data?.hotEvents.map(e => ({
      x: e.bookingRate,
      y: e.viewRate,
      z: e.hotScore * 100,
      name: e.eventName,
      fill: e.hotScore > 0.8 ? '#ef4444' : (e.hotScore > 0.5 ? '#f59e0b' : '#3b82f6')
  })) || [];

  const multiplierData = data?.pricingStats.map(e => ({
      name: e.eventName.length > 15 ? e.eventName.substring(0, 15) + '...' : e.eventName,
      multiplier: e.currentMultiplier,
      base: 1.0
  })) || [];

  // Helper to fill zero-revenue days
  const fillMissingDates = (data: SalesStat[], start: Date, end: Date) => {
      const result: SalesStat[] = [];
      const current = new Date(start);
      // Normalize to YYYY-MM-DD to match backend
      while (current <= end) {
          const dateStr = current.toISOString().split('T')[0];
          const existing = data.find(d => d.date === dateStr);
          result.push(existing || { date: dateStr, revenue: 0, tickets: 0 });
          current.setDate(current.getDate() + 1);
      }
      return result;
  };

  const salesData = (() => {
      if (!data?.totalSales) return [];
      
      // We need to reconstruct the start/end dates used for the query to fill gaps correctly
      let endDate = new Date();
      let startDate = new Date();
      if (viewMode === 'weekly') startDate.setDate(endDate.getDate() - 7);
      else if (viewMode === 'monthly') startDate.setDate(endDate.getDate() - 30);
      else if (viewMode === 'custom' && customDate.start && customDate.end) {
          startDate = new Date(customDate.start);
          endDate = new Date(customDate.end);
      }

      const filled = fillMissingDates(data.totalSales, startDate, endDate);
      
      return filled.map(s => ({
          date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: s.revenue,
          tickets: s.tickets,
          rawDate: s.date 
      }));
  })();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pt-24">
        <div className="max-w-[1600px] mx-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
                          <ArrowLeft className="w-5 h-5" />
                      </Link>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          Analytics Command Center
                      </h1>
                   </div>
                   <p className="text-slate-400 ml-7">Real-time ML Model Performance & Market Intelligence</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 items-center">
                        <button 
                            onClick={() => setViewMode('weekly')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'weekly' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            Weekly
                        </button>
                        <button 
                            onClick={() => setViewMode('monthly')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'monthly' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            Monthly
                        </button>
                         <button 
                            onClick={() => setViewMode('custom')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'custom' ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            Custom
                        </button>
                    </div>

                    {/* Custom Date Inputs */}
                    {viewMode === 'custom' && (
                        <div className="flex gap-2 items-center bg-slate-900 border border-slate-800 rounded-lg p-1 px-2">
                            <input 
                                type="date" 
                                value={customDate.start}
                                className="bg-transparent text-xs text-white outline-none border-b border-slate-700 focus:border-blue-500 w-24"
                                onChange={(e) => setCustomDate(prev => ({ ...prev, start: e.target.value }))}
                            />
                            <span className="text-slate-500">-</span>
                            <input 
                                type="date" 
                                value={customDate.end}
                                className="bg-transparent text-xs text-white outline-none border-b border-slate-700 focus:border-blue-500 w-24"
                                onChange={(e) => setCustomDate(prev => ({ ...prev, end: e.target.value }))}
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Live System</span>
                    </div>
                </div>
            </div>

            {/* Row 1: Total Revenue Trend (New) */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 shadow-xl mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        Total Ticket Sales
                    </h2>
                    <div className="text-xs font-mono text-slate-400">
                        Total Revenue: <span className="text-white font-bold">₹{salesData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}</span>
                    </div>
                </div>
                <div className="h-[250px] w-full outline-none ring-0 focus:outline-none focus:ring-0 active:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none [&_*]:outline-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '6px', fontSize: '12px' }}
                                formatter={(value: any) => [`₹${(value || 0).toLocaleString()}`, 'Revenue']}
                            />
                            <Area 
                                type="linear" 
                                dataKey="revenue" 
                                stroke="#8b5cf6" 
                                fillOpacity={1} 
                                fill="url(#colorRevenue)" 
                                strokeWidth={2}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row 2: Demand Velocity */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 shadow-xl mb-4">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-400" /> 
                            Demand Velocity Map
                        </h2>
                    </div>
                    <div className="flex gap-3 text-xs bg-slate-800/50 px-2 py-1 rounded border border-slate-700">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> Viral</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Warm</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Cold</div>
                    </div>
                </div>
                
                <div className="w-full h-[220px] outline-none ring-0 focus:outline-none focus:ring-0 active:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none [&_*]:outline-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                            <XAxis type="number" dataKey="x" name="Bookings/hr" unit="/hr" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis type="number" dataKey="y" name="Views/hr" unit="/hr" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <ZAxis type="number" dataKey="z" range={[50, 400]} name="Score" />
                            <Tooltip 
                                cursor={{ strokeDasharray: '3 3' }} 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '6px', fontSize: '12px', padding: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Scatter name="Events" data={scatterData} isAnimationActive={false}>
                                {scatterData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="#fff" strokeWidth={1} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row 2: Dynamic Pricing Impact (Full Width) */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 shadow-xl mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        Dynamic Pricing Impact
                    </h2>
                </div>
                <div className="h-[350px] w-full outline-none ring-0 focus:outline-none focus:ring-0 active:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none [&_*]:outline-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={multiplierData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tick={{dy: 5}} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} domain={[0.95, 'auto']} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '6px', fontSize: '12px' }}
                                cursor={{fill: '#1e293b'}}
                            />
                            <Bar dataKey="multiplier" name="Multiplier" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} isAnimationActive={false} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Row 3: Predicted Viral Events (Detailed Table) */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 shadow-xl">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Predicted Viral Events</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-slate-500 font-medium border-b border-slate-800">
                                <tr>
                                    <th className="pb-2 pl-2">Rank</th>
                                    <th className="pb-2">Event</th>
                                    <th className="pb-2 text-right">Metrics (B/V/F)</th>
                                    <th className="pb-2 text-right pr-2">Probability</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {data?.hotEvents.slice(0, 12).map((event, i) => (
                                    <tr key={event.eventId} className="hover:bg-white/5 transition-colors">
                                        <td className="py-2 pl-2 w-8">
                                            <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                                                i === 0 ? 'bg-yellow-500 text-black' : 
                                                i === 1 ? 'bg-slate-300 text-slate-900' : 
                                                i === 2 ? 'bg-orange-700 text-orange-100' : 'text-slate-500 bg-slate-800'
                                            }`}>
                                                {i + 1}
                                            </div>
                                        </td>
                                        <td className="py-2 font-medium text-slate-200">
                                            <div className="truncate max-w-[120px]" title={event.eventName}>{event.eventName}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-[120px]">{event.venueName}</div>
                                        </td>
                                        <td className="py-2 text-right font-mono text-slate-400 text-xs">
                                            <div>B: {event.bookingRate.toFixed(1)}/hr</div>
                                            <div>V: {event.viewRate.toFixed(1)}/hr</div>
                                        </td>
                                        <td className="py-2 text-right pr-2">
                                            <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${
                                                event.hotScore > 0.8 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                                event.hotScore > 0.5 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                                {(event.hotScore * 100).toFixed(0)}%
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Row 4: Price Sensitivity Monitor (Detailed) */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 shadow-xl">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Price Sensitivity</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-slate-500 font-medium border-b border-slate-800">
                                <tr>
                                    <th className="pb-2 pl-2">Event</th>
                                    <th className="pb-2 text-right">Multiplier</th>
                                    <th className="pb-2 text-right">Price</th>
                                    <th className="pb-2 text-right pr-2">Demand</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {data?.pricingStats.slice(0, 12).map((stat) => (
                                    <tr key={stat.eventId} className="hover:bg-white/5 transition-colors">
                                        <td className="py-2 pl-2 font-medium text-slate-200">
                                            <div className="truncate max-w-[120px]" title={stat.eventName}>{stat.eventName}</div>
                                            <div className="text-xs text-slate-500">Base: ₹{stat.basePrice}</div>
                                        </td>
                                        <td className="py-2 text-right">
                                            <span className={`text-xs font-bold ${
                                                stat.currentMultiplier > 1.2 ? 'text-red-400' :
                                                stat.currentMultiplier > 1.0 ? 'text-green-400' : 'text-slate-400'
                                            }`}>
                                                {stat.currentMultiplier.toFixed(2)}x
                                            </span>
                                        </td>
                                        <td className="py-2 text-right font-bold text-slate-200">
                                            ₹{(stat.basePrice * stat.currentMultiplier).toFixed(0)}
                                        </td>
                                        <td className="py-2 text-right pr-2 text-slate-400 font-mono text-xs">
                                            {stat.bookingRateByHour.toFixed(1)}/hr
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql';
import { gql } from 'graphql-request';
import { useAuth } from '@/providers/AuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TicketWallet } from '@/components/dashboard/TicketWallet';
import { OrderHistory } from '@/components/dashboard/OrderHistory';
import { Loader2, Ticket as TicketIcon, History } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// --- Queries ---
const GET_MY_ORDERS = gql`
  query GetMyOrders {
    myOrders {
      id
      status
      totalAmount
      createdAt
      eventId
      tickets {
        id
        sectionName
        row
        number
        qrCode
      }
      event {
        id
        name
        date
        venue {
          name
        }
      }
    }
  }
`;

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch Orders (including event details)
  const { data: orderData, isLoading: ordersLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => graphqlClient.request(GET_MY_ORDERS),
  });

  if (ordersLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const orders = (orderData as any)?.myOrders || [];

  // Filter for Ticket Wallet: SHOW ALL for debugging/visibility
  // const cutoffDate = new Date();
  // cutoffDate.setHours(cutoffDate.getHours() - 24);
  const upcomingOrders = orders; // .filter((o: any) => o.event && new Date(o.event.date) > cutoffDate);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 py-6">
        
        {/* Header Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Hello, <span className="text-primary">{user?.fullName.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Here's what's happening with your tickets.
            </p>
          </div>
          <Link href="/events">
            <Button size="sm" className="shadow-lg shadow-primary/20 h-9">Find New Events</Button>
          </Link>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="wallet" className="w-full space-y-6">
          <TabsList className="bg-slate-900 border border-slate-700 p-1 rounded-xl w-full md:w-auto inline-flex">
            <TabsTrigger 
              value="wallet" 
              className="px-4 py-2 rounded-lg text-sm data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex gap-2"
            >
              <TicketIcon size={16} /> Ticket Wallet
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="px-4 py-2 rounded-lg text-sm data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex gap-2"
            >
              <History size={16} /> Order History
            </TabsTrigger>
          </TabsList>

          {/* 1. Wallet Tab (Upcoming Tickets) */}
          <TabsContent value="wallet" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
            <TicketWallet orders={upcomingOrders} userFullName={user?.fullName} />
          </TabsContent>

          {/* 2. History Tab (Past Orders List) */}
          <TabsContent value="history" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
            <OrderHistory orders={orders} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
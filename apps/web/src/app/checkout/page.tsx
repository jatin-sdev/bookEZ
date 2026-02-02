"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, ShieldCheck, Ticket, Lock } from "lucide-react";
import Link from "next/link";
import { getOrder, Order } from "@/lib/api";
import { useTimer } from "@/hooks/useTimer";
import PaymentForm from "@/components/checkout/PaymentForm";
import { useToast } from "@/components/ToastProvider";
import { gql } from "graphql-request";
import { graphqlClient } from "@/lib/graphql";

const CANCEL_BOOKING = gql`
  mutation CancelBooking($orderId: ID!) {
    cancelBooking(orderId: $orderId)
  }
`;

// Wrap content in Suspense for useSearchParams
function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // 5 Minute Timer
  const { formattedTime } = useTimer(new Date(Date.now() + 5 * 60 * 1000), () => {
    addToast("Time expired! Your seats have been released.", "error");
    router.push("/");
  });

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    getOrder(orderId)
      .then((res) => {
        // @ts-ignore - Graphql response structure adaptation if needed
        const orderData = res.data?.order || res.data;
        setOrder(orderData);
      })
      .catch((err) => {
        console.error(err);
        addToast("Failed to load order", "error");
      })
      .finally(() => setLoading(false));
  }, [orderId, router, addToast]);

  // Handle Abandoned Checkout (Unmount / Navigation away)
  // Handle Abandoned Checkout (Unmount / Navigation away)
  // We use a ref to debounce the cleanup and handle React Strict Mode double-invocation
  const cleanupTimeoutRef =  useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only set up cleanup if we have a valid order ID
    if (!orderId) return;

    // Clear any pending cleanup from a previous unmount (Strict Mode handling)
    if (cleanupTimeoutRef.current) {
        console.log("♻️ Strict Mode: Cancelled pending cleanup for order", orderId);
        clearTimeout(cleanupTimeoutRef.current);
        cleanupTimeoutRef.current = null;
    }

    return () => {
        // [CRITICAL] Check if we are really leaving the flow.
        
        const isSuccess = sessionStorage.getItem(`order_success_${orderId}`);
        if(isSuccess) return;

        // Debounce the actual cancellation call
        cleanupTimeoutRef.current = setTimeout(() => {
             console.log("⚠️ Abandoning checkout order (Debounced):", orderId);
        
            const query = JSON.stringify({
                query: `mutation CancelBooking($orderId: ID!) { cancelBooking(orderId: $orderId) }`,
                variables: { orderId }
            });

            fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
                },
                body: query,
                keepalive: true
            }).catch(err => console.error("Failed to cancel abandoned order", err));
        }, 1000); // 1 second delay to allow for Remount
    };
  }, [orderId]);



  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center text-slate-400">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full mb-4"></div>
          <p>Securing your session...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="bg-slate-950 font-display text-white">
      {/* Navigation removed to rely on global Layout */}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="space-y-2">
            <Link href="/" className="text-sm font-medium text-slate-500 hover:text-primary flex items-center gap-2 mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Event
            </Link>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Secure Checkout</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl">
              Complete your purchase within the time limit to secure your seats. Your connection is encrypted.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Time Remaining</p>
              <p className="text-xl font-black font-mono text-slate-900 dark:text-white">{formattedTime}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                <h3 className="text-lg font-bold">Order Summary</h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Event Card */}
                <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div
                    className="w-20 h-20 bg-cover bg-center rounded-lg shrink-0"
                    style={{ backgroundImage: `url(${order.eventImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745'})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Confirmed</p>
                    <h4 className="font-bold text-sm line-clamp-1">{order.event?.name || order.eventName || 'Event Name'}</h4>
                    <p className="text-xs text-slate-500 mt-1">{order.event?.venue?.name || order.eventLocation || 'Venue Location'}</p>
                    <p className="text-xs text-slate-500">{new Date(Number(order.event?.date || order.eventDate || Date.now())).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Ticket List */}
                <div className="space-y-3">
                  {order.tickets.map((t) => (
                    <div key={t.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">{t.sectionName || 'General Admission'}</p>
                        <p className="text-xs text-slate-500">Row {t.row || 'GA'}, Seat {t.number}</p>
                      </div>
                      <span className="font-bold">₹{(t.price / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span>₹{(order.totalAmount / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Fees</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between text-xl font-black text-slate-900 dark:text-white pt-2">
                    <span>Total</span>
                    <span>₹{(order.totalAmount / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 opacity-60 grayscale hover:grayscale-0 transition-all">
              <div className="flex flex-col items-center gap-2 text-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <span className="text-[10px] font-bold uppercase">Fraud Protection</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <Lock className="w-6 h-6 text-primary" />
                <span className="text-[10px] font-bold uppercase">256-bit SSL</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <Ticket className="w-6 h-6 text-primary" />
                <span className="text-[10px] font-bold uppercase">Guarantee</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Payment Form */}
          <div className="lg:col-span-7 h-full">
            <PaymentForm
              orderId={order.id}
              amount={order.totalAmount}
              onPaySuccess={() => {
                 // Mark as success so unmount doesn't cancel it
                 if (orderId) sessionStorage.setItem(`order_success_${orderId}`, 'true');
                 router.push("/tickets");
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background-light dark:bg-background-dark" />}>
      <CheckoutContent />
    </Suspense>
  );
}
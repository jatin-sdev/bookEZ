"use client";

import { useState } from "react";
import { CreditCard, QrCode, Wallet, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useAuth } from "@/providers/AuthProvider";
import { useMutation } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql";
import { gql } from "graphql-request";
import { useToast } from "@/components/ToastProvider";

// --- GraphQL Mutations ---
const CREATE_PAYMENT_ORDER = gql`
  mutation CreatePaymentOrder($orderId: ID!) {
    createPaymentOrder(orderId: $orderId) {
      id
      amount
      currency
      keyId
    }
  }
`;

const CONFIRM_PAYMENT = gql`
  mutation ConfirmPayment(
    $orderId: ID!, 
    $razorpayOrderId: String!, 
    $razorpayPaymentId: String!, 
    $signature: String!
  ) {
    confirmPayment(
      orderId: $orderId, 
      razorpayOrderId: $razorpayOrderId, 
      razorpayPaymentId: $razorpayPaymentId, 
      signature: $signature
    )
  }
`;

interface PaymentFormProps {
  orderId: string; // <--- Changed from 'amount' to 'orderId' as source of truth
  amount: number;
  onPaySuccess: () => void; // Renamed for clarity
}

type PaymentMethod = "CARD" | "UPI" | "WALLET";

export default function PaymentForm({ orderId, amount, onPaySuccess }: PaymentFormProps) {
  const [method, setMethod] = useState<PaymentMethod>("CARD");
  const [isProcessing, setIsProcessing] = useState(false);
  const isRazorpayLoaded = useRazorpay();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");

  // 1. Create Order Mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => graphqlClient.request<{ createPaymentOrder: any }>(CREATE_PAYMENT_ORDER, { orderId }),
  });

  // 2. Verify Payment Mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: async (data: any) => graphqlClient.request(CONFIRM_PAYMENT, data),
    onSuccess: () => {
      addToast("Payment Confirmed! Redirecting...", "success");
      onPaySuccess();
    },
    onError: () => {
      addToast("Payment verification failed. Please contact support.", "error");
      setIsProcessing(false);
    }
  });

  const handlePayment = async () => {
    if (!isRazorpayLoaded) {
      addToast("Payment gateway is initializing...", "error");
      return;
    }

    if (!phoneNumber) {
      addToast("Please enter your phone number", "error");
      return;
    }

    setIsProcessing(true);

    try {
      // Step A: Create Razorpay Order on Backend
      const { createPaymentOrder } = await createOrderMutation.mutateAsync();

      const options = {
        key: createPaymentOrder.keyId,
        amount: createPaymentOrder.amount,
        currency: createPaymentOrder.currency,
        name: "TicketForge AI",
        description: `Order #${orderId.slice(0, 8)}`,
        order_id: createPaymentOrder.id, 
        
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
          contact: phoneNumber,
          method: method === "UPI" ? "upi" : method === "WALLET" ? "wallet" : "card"
        } as any,
        
        // Step B: Handle Success (User Paid)
        handler: async (response: any) => {
          try {
            // Step C: Verify Signature on Backend
            await confirmPaymentMutation.mutateAsync({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
          } catch (err) {
             // Mutation onError handles UI
          }
        },
        
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            addToast("Payment cancelled by user", "info");
          }
        },
        theme: {
          color: "#3b82f6" // Primary Blue
        }
      };

      // Open Razorpay
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      addToast("Failed to initiate payment.", "error");
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Payment Method</h3>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 border-b border-slate-100 dark:border-slate-800">
        {[
          { id: "CARD", icon: CreditCard, label: "Card" },
          { id: "UPI", icon: QrCode, label: "UPI" },
          { id: "WALLET", icon: Wallet, label: "Wallet" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id as PaymentMethod)}
            disabled={isProcessing}
            className={`py-4 flex flex-col items-center gap-1 border-b-2 transition-all ${
              method === m.id
                ? "border-primary bg-primary/5 text-primary"
                : "border-transparent text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            <m.icon className={`w-6 h-6 ${method === m.id ? "text-primary" : "text-slate-400"}`} />
            <span className="text-xs font-bold uppercase">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-center items-center w-full">
         {/* We simplify the form since Razorpay handles the inputs in the modal */}
         <div className="text-center space-y-4 max-w-sm w-full">
            
            <div className="text-left w-full space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Phone Number</label>
                <input 
                    type="tel" 
                    placeholder="Enter phone number" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-medium"
                />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl flex items-center gap-4 text-left">
                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0 text-primary shadow-sm">
                    <Lock className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Secure Gateway</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Redirecting to Razorpay for <span className="font-bold text-slate-900 dark:text-white">₹{(amount / 100).toFixed(2)}</span>
                    </p>
                </div>
            </div>
         </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <Button 
            onClick={handlePayment} 
            disabled={isProcessing || !isRazorpayLoaded}
            variant="primary" 
            size="lg" 
            className="w-full h-16 text-lg bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20"
        >
            {isProcessing ? (
                <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </span>
            ) : (
                <span className="flex items-center gap-2">
                    <Lock className="w-5 h-5" /> Pay Now
                </span>
            )}
        </Button>
        <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest mt-4">
            Encrypted • PCI-DSS Compliant
        </p>
      </div>
    </div>
  );
}
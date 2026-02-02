import { useState, useEffect } from 'react';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

export const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Prevent duplicate script injection
    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
    
    if (existingScript) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      setIsLoaded(false);
    };

    document.body.appendChild(script);

    return () => {
      // Optional: Cleanup if needed, though usually we want to keep it cached
    };
  }, []);

  return isLoaded;
};
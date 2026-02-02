import { Suspense } from 'react';
import Footer from "@/components/Footer";
import EventListingPage from "@/components/events/EventListingPage";

export default function EventsPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <EventListingPage 
          title="All Events" 
          description="Discover amazing events happening near you. Browse through concerts, sports, festivals and more."
          categoryFilter="All" 
        />
      </Suspense>
      <Footer />
    </>
  );
}
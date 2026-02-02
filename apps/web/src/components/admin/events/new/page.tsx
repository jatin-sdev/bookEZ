'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql';
import { gql } from 'graphql-request';
import { Button } from '@/components/ui/Button';

// --- Validation Schema ---
const eventSchema = z.object({
  name: z.string().min(3, "Name is required"),
  description: z.string().optional(),
  date: z.string().refine((date) => new Date(date) > new Date(), {
    message: "Event date must be in the future",
  }),
  venueId: z.string().min(1, "Venue is required"),
});

type EventFormValues = z.infer<typeof eventSchema>;

// --- Queries & Mutations ---
const GET_VENUES = gql`
  query GetVenues {
    venues {
      id
      name
      location
      capacity
    }
  }
`;

const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      status
    }
  }
`;

const PUBLISH_EVENT = gql`
  mutation PublishEvent($id: ID!) {
    publishEvent(id: $id) {
      id
      status
    }
  }
`;

export default function CreateEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema as any),
  });

  // Fetch Venues
  const { data: venuesData, isLoading: venuesLoading } = useQuery({
    queryKey: ['venues'],
    queryFn: () => graphqlClient.request(GET_VENUES),
  });

  // Mutations
  const createEventMutation = useMutation({
    mutationFn: (vars: any) => graphqlClient.request(CREATE_EVENT, vars),
  });

  const publishEventMutation = useMutation({
    mutationFn: (vars: any) => graphqlClient.request(PUBLISH_EVENT, vars),
  });

  // Submit Handler
  const onSubmit = async (data: EventFormValues) => {
    try {
      const res: any = await createEventMutation.mutateAsync({
        input: {
          name: data.name,
          description: data.description,
          venueId: data.venueId,
          date: new Date(data.date).toISOString(),
        }
      });
      
      setCreatedEventId(res.createEvent.id);
      setStep(2); // Move to Publish Step
    } catch (err) {
      console.error(err);
      alert('Failed to create event draft.');
    }
  };

  const handlePublish = async () => {
    if (!createdEventId) return;
    try {
      await publishEventMutation.mutateAsync({ id: createdEventId });
      router.push('/admin/events');
    } catch (err) {
      alert('Failed to publish event.');
    }
  };

  if (venuesLoading) return <div className="p-8">Loading venues...</div>;

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
      
      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold", step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200")}>1</div>
        <div className="h-1 flex-1 bg-gray-200">
           <div className={cn("h-full bg-blue-600 transition-all", step >= 2 ? "w-full" : "w-0")} />
        </div>
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold", step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200")}>2</div>
      </div>

      {step === 1 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg border">
          <div>
            <label className="block text-sm font-medium mb-1">Event Name</label>
            <input {...register('name')} className="w-full p-2 border rounded" placeholder="e.g. Taylor Swift Eras Tour" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea {...register('description')} className="w-full p-2 border rounded" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium mb-1">Venue</label>
                <select {...register('venueId')} className="w-full p-2 border rounded">
                  <option value="">Select a Venue</option>
                  {(venuesData as any)?.venues?.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.name} (Cap: {v.capacity})</option>
                  ))}
                </select>
                {errors.venueId && <p className="text-red-500 text-sm mt-1">{errors.venueId.message}</p>}
             </div>

             <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input type="datetime-local" {...register('date')} className="w-full p-2 border rounded" />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
             </div>
          </div>

          <Button type="submit" disabled={createEventMutation.isPending} className="w-full">
            {createEventMutation.isPending ? "Creating Draft..." : "Create Draft & Continue"}
          </Button>
        </form>
      )}

      {step === 2 && (
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-green-600 mb-2">Draft Created!</h3>
            <p className="text-gray-600">
              Your event is saved as a <strong>DRAFT</strong>. <br/>
              Clicking publish will generate the inventory and make it live for users.
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
             <Button variant="outline" onClick={() => router.push('/admin/events')}>
               Save as Draft
             </Button>
             <Button onClick={handlePublish} disabled={publishEventMutation.isPending}>
               {publishEventMutation.isPending ? "Publishing..." : "Publish Event Now"}
             </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper for conditional classnames
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
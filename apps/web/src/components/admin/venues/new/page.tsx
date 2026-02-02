'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { VenueDesigner } from '@/components/admin/venues/VenueDesigner';
import { graphqlClient } from '@/lib/graphql';
import { gql } from 'graphql-request';
import { useMutation } from '@tanstack/react-query';
import { PlacedSeat } from '@/components/admin/venues/VenueDesigner/DroppableCanvas';

// 1. Define Mutations
const CREATE_VENUE = gql`
  mutation CreateVenue($input: CreateVenueInput!) {
    createVenue(input: $input) {
      id
      name
    }
  }
`;

const ADD_SECTION = gql`
  mutation AddSection($venueId: ID!, $input: CreateSectionInput!) {
    addSection(venueId: $venueId, input: $input) {
      id
    }
  }
`;

export default function NewVenuePage() {
  const router = useRouter();

  // 2. Setup Mutations
  const createVenueMutation = useMutation({
    mutationFn: async (variables: any) => graphqlClient.request(CREATE_VENUE, variables),
  });

  const addSectionMutation = useMutation({
    mutationFn: async (variables: any) => graphqlClient.request(ADD_SECTION, variables),
  });

  // 3. Save Logic
  const handleSave = async (seats: PlacedSeat[], image: string) => {
    try {
      // Step A: Create the Venue Container
      const venueRes: any = await createVenueMutation.mutateAsync({
        input: {
          name: `Venue ${new Date().toLocaleDateString()}`,
          location: "Virtual Location",
          capacity: seats.length
        }
      });
      
      const venueId = venueRes.createVenue.id;

      // Step B: Create a "Custom Layout" Section containing all these seats
      // We group them into one generic "Main Hall" section for this MVP phase
      const customSeats = seats.map((s, idx) => ({
        number: (idx + 1).toString(),
        row: null, // Custom layouts often don't have rows
        x: Math.round(s.x), // Store as integer percentage for simplicity
        y: Math.round(s.y)
      }));

      await addSectionMutation.mutateAsync({
        venueId,
        input: {
          name: "Main Hall",
          basePrice: 1000, // Default base price (10.00)
          type: "ASSIGNED",
          customSeats: customSeats, // ✅ Now properly passing custom seats to backend
        }
      });
      
      // Step C: If your backend requires a separate 'updateSeatPositions' call, do it here.
      // But based on the service, 'addSection' handles creation.
      
      alert('Venue Created Successfully!');
      router.push('/admin/venues');
      
    } catch (error) {
      console.error('Failed to create venue:', error);
      alert('Error saving venue. Check console.');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Design New Venue</h1>
        <p className="text-gray-500">Upload a floor plan and drag seats to define the layout.</p>
      </div>
      
      <VenueDesigner 
        onSave={handleSave} 
        isSaving={createVenueMutation.isPending || addSectionMutation.isPending} 
      />
    </div>
  );
}
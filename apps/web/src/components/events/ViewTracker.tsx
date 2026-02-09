'use client';

import { useEffect } from 'react';
import { gql } from 'graphql-request';
import { fetchClient } from '@/lib/fetchers';

const RECORD_VIEW_MUTATION = gql`
  mutation RecordEventView($eventId: ID!) {
    recordEventView(eventId: $eventId)
  }
`;

export const ViewTracker = ({ eventId }: { eventId: string }) => {
  useEffect(() => {
    const record = async () => {
      try {
        await fetchClient(RECORD_VIEW_MUTATION, { eventId });
      } catch (err) {
        // Ignore errors for analytics
        console.warn('Failed to record view', err);
      }
    };
    
    // Small delay to ensure it's a real view
    const timer = setTimeout(record, 1000);
    return () => clearTimeout(timer);
  }, [eventId]);

  return null;
};

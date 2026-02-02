import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_REALTIME_URL || 'http://localhost:4000';

export const useSocket = (eventId: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 1. Initialize Connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('🔌 Connected to Real-time Server');
      // 2. Join the specific Event Room
      socket.emit('join-event', eventId);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected');
    });

    // Cleanup on unmount
    return () => {
      if (socket) socket.disconnect();
    };
  }, [eventId]);

  return socketRef.current;
};
import { io, Socket } from 'socket.io-client';

// Use environment variable or default to localhost
const SOCKET_URL = process.env.NEXT_PUBLIC_REALTIME_URL || 'http://localhost:4000';

class SocketClient {
  socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Realtime Service');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from Realtime Service');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   *  Join a specific event room to receive updates.
   * Must be called when the user visits an Event page.
   */
  joinEvent(eventId: string) {
    if (this.socket) {
      this.socket.emit('join-event', eventId);
    }
  }

  /**
   * Leave the event room (cleanup).
   * Must be called when the user leaves the page.
   */
  leaveEvent(eventId: string) {
    if (this.socket) {
      this.socket.emit('leave-event', eventId);
    }
  }

  onSeatUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('seat-update', callback);
    }
  }
  
  offSeatUpdate() {
    if (this.socket) {
      this.socket.off('seat-update');
    }
  }
}

export const socketClient = new SocketClient();
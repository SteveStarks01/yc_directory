'use client';

// Temporarily disable socket.io-client to fix build issues
// import { io, Socket } from 'socket.io-client';

// Mock Socket interface for development
interface Socket {
  connected: boolean;
  on: (event: string, callback: Function) => void;
  emit: (event: string, data?: any) => void;
  connect: () => void;
  disconnect: () => void;
}

// Real-time event types
export interface RealtimeEvents {
  // Post events
  'post:created': {
    postId: string;
    communityId: string;
    post: any;
  };
  'post:updated': {
    postId: string;
    communityId: string;
    changes: any;
  };
  'post:deleted': {
    postId: string;
    communityId: string;
  };
  'post:reaction': {
    postId: string;
    communityId: string;
    reactionType: string;
    action: 'add' | 'remove';
    userId: string;
    count: number;
  };

  // Comment events
  'comment:created': {
    commentId: string;
    postId: string;
    communityId: string;
    comment: any;
  };
  'comment:updated': {
    commentId: string;
    postId: string;
    communityId: string;
    changes: any;
  };
  'comment:deleted': {
    commentId: string;
    postId: string;
    communityId: string;
  };
  'comment:reaction': {
    commentId: string;
    postId: string;
    communityId: string;
    reactionType: string;
    action: 'add' | 'remove';
    userId: string;
    count: number;
  };

  // User presence events
  'user:online': {
    userId: string;
    communityId: string;
  };
  'user:offline': {
    userId: string;
    communityId: string;
  };
  'user:typing': {
    userId: string;
    postId?: string;
    commentId?: string;
    isTyping: boolean;
  };

  // Community events
  'community:member_joined': {
    userId: string;
    communityId: string;
  };
  'community:member_left': {
    userId: string;
    communityId: string;
  };
}

export type RealtimeEventName = keyof RealtimeEvents;

class WebSocketManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners = new Map<string, Set<Function>>();
  private subscribedRooms = new Set<string>();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeConnection();
    }
  }

  private initializeConnection() {
    try {
      // Temporarily disabled - mock connection for development
      console.log('WebSocket manager initialized (mock mode)');

      // Create a mock socket for development
      this.socket = {
        connected: false,
        on: (event: string, callback: Function) => {
          console.log(`Mock socket: listening for ${event}`);
        },
        emit: (event: string, data?: any) => {
          console.log(`Mock socket: emitting ${event}`, data);
        },
        connect: () => {
          console.log('Mock socket: connecting');
          this.isConnected = true;
        },
        disconnect: () => {
          console.log('Mock socket: disconnecting');
          this.isConnected = false;
        }
      };

      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Rejoin previously subscribed rooms
      this.subscribedRooms.forEach(room => {
        this.joinRoom(room);
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnection();
    });

    // Setup listeners for all realtime events
    Object.keys(this.getEventTypes()).forEach(eventName => {
      this.socket!.on(eventName, (data: any) => {
        this.handleRealtimeEvent(eventName as RealtimeEventName, data);
      });
    });
  }

  private getEventTypes(): Record<RealtimeEventName, any> {
    return {
      'post:created': null,
      'post:updated': null,
      'post:deleted': null,
      'post:reaction': null,
      'comment:created': null,
      'comment:updated': null,
      'comment:deleted': null,
      'comment:reaction': null,
      'user:online': null,
      'user:offline': null,
      'user:typing': null,
      'community:member_joined': null,
      'community:member_left': null,
    };
  }

  private handleRealtimeEvent<T extends RealtimeEventName>(
    eventName: T,
    data: RealtimeEvents[T]
  ) {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.socket?.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try to get token from localStorage or session storage
    return localStorage.getItem('auth-token') || 
           sessionStorage.getItem('auth-token') || 
           null;
  }

  // Public methods
  public isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  public joinRoom(room: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-room', room);
      this.subscribedRooms.add(room);
    }
  }

  public leaveRoom(room: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-room', room);
      this.subscribedRooms.delete(room);
    }
  }

  public subscribe<T extends RealtimeEventName>(
    eventName: T,
    listener: (data: RealtimeEvents[T]) => void
  ): () => void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    
    this.eventListeners.get(eventName)!.add(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventName);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.eventListeners.delete(eventName);
        }
      }
    };
  }

  public emit<T extends RealtimeEventName>(
    eventName: T,
    data: RealtimeEvents[T]
  ): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(eventName, data);
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.subscribedRooms.clear();
      this.eventListeners.clear();
    }
  }

  // Utility methods for common operations
  public joinCommunity(communityId: string): void {
    this.joinRoom(`community:${communityId}`);
  }

  public leaveCommunity(communityId: string): void {
    this.leaveRoom(`community:${communityId}`);
  }

  public joinPost(postId: string): void {
    this.joinRoom(`post:${postId}`);
  }

  public leavePost(postId: string): void {
    this.leaveRoom(`post:${postId}`);
  }

  public sendTypingIndicator(postId: string, isTyping: boolean): void {
    this.emit('user:typing', {
      userId: 'current-user', // This should be replaced with actual user ID
      postId,
      isTyping,
    });
  }
}

// Singleton instance
let websocketManager: WebSocketManager | null = null;

export function getWebSocketManager(): WebSocketManager {
  if (!websocketManager) {
    websocketManager = new WebSocketManager();
  }
  return websocketManager;
}

export default WebSocketManager;

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getWebSocketManager, RealtimeEvents, RealtimeEventName } from '@/lib/realtime/websocket-manager';

/**
 * Hook for managing WebSocket connection status
 */
export function useWebSocketConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsManager = getWebSocketManager();

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(wsManager.isSocketConnected());
    };

    // Check connection status periodically
    const interval = setInterval(checkConnection, 1000);
    checkConnection(); // Initial check

    return () => clearInterval(interval);
  }, [wsManager]);

  return {
    isConnected,
    reconnectAttempts,
    wsManager,
  };
}

/**
 * Hook for subscribing to real-time events
 */
export function useRealtimeEvent<T extends RealtimeEventName>(
  eventName: T,
  handler: (data: RealtimeEvents[T]) => void,
  dependencies: any[] = []
) {
  const wsManager = getWebSocketManager();
  const handlerRef = useRef(handler);

  // Update handler ref when dependencies change
  useEffect(() => {
    handlerRef.current = handler;
  }, dependencies);

  useEffect(() => {
    const unsubscribe = wsManager.subscribe(eventName, (data) => {
      handlerRef.current(data);
    });

    return unsubscribe;
  }, [eventName, wsManager]);
}

/**
 * Hook for managing community real-time subscriptions
 */
export function useCommunityRealtime(communityId: string | null) {
  const wsManager = getWebSocketManager();
  const { data: session } = useSession();

  useEffect(() => {
    if (!communityId || !session?.user?.id) return;

    // Join community room
    wsManager.joinCommunity(communityId);

    return () => {
      // Leave community room on cleanup
      wsManager.leaveCommunity(communityId);
    };
  }, [communityId, session?.user?.id, wsManager]);

  return {
    joinPost: useCallback((postId: string) => {
      wsManager.joinPost(postId);
    }, [wsManager]),
    
    leavePost: useCallback((postId: string) => {
      wsManager.leavePost(postId);
    }, [wsManager]),
  };
}

/**
 * Hook for real-time post updates
 */
export function useRealtimePost(postId: string | null) {
  const [post, setPost] = useState<any>(null);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [commentCount, setCommentCount] = useState(0);
  const wsManager = getWebSocketManager();

  // Subscribe to post events
  useRealtimeEvent('post:updated', useCallback((data) => {
    if (data.postId === postId) {
      setPost((prev: any) => ({ ...prev, ...data.changes }));
    }
  }, [postId]));

  useRealtimeEvent('post:reaction', useCallback((data) => {
    if (data.postId === postId) {
      setReactions(prev => ({
        ...prev,
        [data.reactionType]: data.count,
      }));
    }
  }, [postId]));

  useRealtimeEvent('comment:created', useCallback((data) => {
    if (data.postId === postId) {
      setCommentCount(prev => prev + 1);
    }
  }, [postId]));

  useRealtimeEvent('comment:deleted', useCallback((data) => {
    if (data.postId === postId) {
      setCommentCount(prev => Math.max(0, prev - 1));
    }
  }, [postId]));

  // Join/leave post room
  useEffect(() => {
    if (!postId) return;

    wsManager.joinPost(postId);
    return () => wsManager.leavePost(postId);
  }, [postId, wsManager]);

  return {
    post,
    reactions,
    commentCount,
    setPost,
    setReactions,
    setCommentCount,
  };
}

/**
 * Hook for real-time comment updates
 */
export function useRealtimeComments(postId: string | null) {
  const [comments, setComments] = useState<any[]>([]);
  const [newCommentIds, setNewCommentIds] = useState<Set<string>>(new Set());

  useRealtimeEvent('comment:created', useCallback((data) => {
    if (data.postId === postId) {
      setComments(prev => [...prev, data.comment]);
      setNewCommentIds(prev => new Set([...prev, data.commentId]));
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        setNewCommentIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.commentId);
          return newSet;
        });
      }, 3000);
    }
  }, [postId]));

  useRealtimeEvent('comment:updated', useCallback((data) => {
    if (data.postId === postId) {
      setComments(prev => 
        prev.map(comment => 
          comment._id === data.commentId 
            ? { ...comment, ...data.changes }
            : comment
        )
      );
    }
  }, [postId]));

  useRealtimeEvent('comment:deleted', useCallback((data) => {
    if (data.postId === postId) {
      setComments(prev => 
        prev.filter(comment => comment._id !== data.commentId)
      );
    }
  }, [postId]));

  useRealtimeEvent('comment:reaction', useCallback((data) => {
    if (data.postId === postId) {
      setComments(prev => 
        prev.map(comment => {
          if (comment._id === data.commentId) {
            const newReactions = { ...comment.reactions };
            newReactions[data.reactionType] = data.count;
            return { ...comment, reactions: newReactions };
          }
          return comment;
        })
      );
    }
  }, [postId]));

  return {
    comments,
    newCommentIds,
    setComments,
  };
}

/**
 * Hook for typing indicators
 */
export function useTypingIndicator(postId: string | null) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const wsManager = getWebSocketManager();
  const { data: session } = useSession();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useRealtimeEvent('user:typing', useCallback((data) => {
    if (data.postId === postId && data.userId !== session?.user?.id) {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });

      // Auto-remove typing indicator after 3 seconds
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }, 3000);
      }
    }
  }, [postId, session?.user?.id]));

  const startTyping = useCallback(() => {
    if (!postId || !session?.user?.id) return;

    wsManager.sendTypingIndicator(postId, true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      wsManager.sendTypingIndicator(postId, false);
    }, 2000);
  }, [postId, session?.user?.id, wsManager]);

  const stopTyping = useCallback(() => {
    if (!postId || !session?.user?.id) return;

    wsManager.sendTypingIndicator(postId, false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [postId, session?.user?.id, wsManager]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    typingUsers: Array.from(typingUsers),
    startTyping,
    stopTyping,
  };
}

/**
 * Hook for user presence
 */
export function useUserPresence(communityId: string | null) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useRealtimeEvent('user:online', useCallback((data) => {
    if (data.communityId === communityId) {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    }
  }, [communityId]));

  useRealtimeEvent('user:offline', useCallback((data) => {
    if (data.communityId === communityId) {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    }
  }, [communityId]));

  return {
    onlineUsers: Array.from(onlineUsers),
    isUserOnline: useCallback((userId: string) => onlineUsers.has(userId), [onlineUsers]),
  };
}

export default {
  useWebSocketConnection,
  useRealtimeEvent,
  useCommunityRealtime,
  useRealtimePost,
  useRealtimeComments,
  useTypingIndicator,
  useUserPresence,
};

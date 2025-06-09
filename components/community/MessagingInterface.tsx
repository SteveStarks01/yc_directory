'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  CheckCheckIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  _id: string;
  messageType: string;
  content: string;
  attachments?: any[];
  links?: any[];
  status: string;
  priority: string;
  isEdited: boolean;
  editedAt?: string;
  sentAt: string;
  sender: {
    _id: string;
    userId: string;
    role: string;
    profileImage?: any;
  };
  replyTo?: {
    _id: string;
    content: string;
    sender: {
      userId: string;
    };
  };
  readBy?: Array<{
    user: {
      userId: string;
    };
    readAt: string;
  }>;
}

interface Conversation {
  _id: string;
  conversationType: string;
  title?: string;
  participants: Array<{
    user: {
      _id: string;
      userId: string;
      role: string;
      profileImage?: any;
      company?: string;
    };
    role: string;
  }>;
  unreadCount?: number;
}

interface MessagingInterfaceProps {
  conversationId: string;
  currentUserId: string;
}

export default function MessagingInterface({ conversationId, currentUserId }: MessagingInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (conversationId) {
      fetchConversation();
      fetchMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations?conversationId=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setConversation(data.conversation);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/messages?conversationId=${conversationId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages.reverse()); // Reverse to show oldest first
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const messageData = {
        conversationId,
        content: newMessage.trim(),
        messageType: 'text',
        replyTo: replyTo?._id,
      };

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        setReplyTo(null);
        
        // Auto-resize textarea
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const getMessageStatus = (message: Message) => {
    if (message.sender.userId === currentUserId) {
      const readByOthers = message.readBy?.filter(read => read.user.userId !== currentUserId);
      if (readByOthers && readByOthers.length > 0) {
        return <CheckCheckIcon className="h-4 w-4 text-blue-500" />;
      }
      return <CheckIcon className="h-4 w-4 text-gray-400" />;
    }
    return null;
  };

  const formatMessageTime = (sentAt: string) => {
    return formatDistanceToNow(new Date(sentAt), { addSuffix: true });
  };

  const getConversationTitle = () => {
    if (conversation?.title) return conversation.title;
    
    if (conversation?.conversationType === 'direct') {
      const otherParticipant = conversation.participants?.find(
        p => p.user.userId !== currentUserId
      );
      return otherParticipant?.user.userId || 'Direct Message';
    }
    
    return `${conversation?.conversationType || 'Group'} Chat`;
  };

  if (isLoading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{getConversationTitle()}</CardTitle>
            {conversation && (
              <p className="text-sm text-muted-foreground">
                {conversation.participants?.length} participants
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm">
            <EllipsisVerticalIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.sender.userId === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] ${
                    message.sender.userId === currentUserId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  } rounded-lg p-3`}
                >
                  {/* Reply indicator */}
                  {message.replyTo && (
                    <div className="mb-2 p-2 bg-black/10 rounded text-xs">
                      <p className="font-medium">{message.replyTo.sender.userId}</p>
                      <p className="truncate">{message.replyTo.content}</p>
                    </div>
                  )}

                  {/* Sender info (for group chats) */}
                  {conversation?.conversationType !== 'direct' && 
                   message.sender.userId !== currentUserId && (
                    <div className="flex items-center space-x-2 mb-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={message.sender.profileImage?.asset?.url} />
                        <AvatarFallback className="text-xs">
                          {message.sender.userId.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{message.sender.userId}</span>
                      <Badge variant="outline" className="text-xs">
                        {message.sender.role}
                      </Badge>
                    </div>
                  )}

                  {/* Message content */}
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {/* Message metadata */}
                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>{formatMessageTime(message.sentAt)}</span>
                    <div className="flex items-center space-x-1">
                      {message.isEdited && <span>(edited)</span>}
                      {getMessageStatus(message)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Reply indicator */}
      {replyTo && (
        <div className="border-t border-b bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">
                Replying to {replyTo.sender.userId}
              </p>
              <p className="text-sm truncate">{replyTo.content}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyTo(null)}
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="border-t p-4">
        <div className="flex items-end space-x-2">
          <Button variant="ghost" size="sm">
            <PaperClipIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <FaceSmileIcon className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="min-h-[40px] max-h-[120px] resize-none"
              rows={1}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            size="sm"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

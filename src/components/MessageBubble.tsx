import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
  isInterim?: boolean;
}

export const MessageBubble = ({ message, isInterim = false }: MessageBubbleProps) => {
  return (
    <div className={`
      flex items-start space-x-3 fade-in-up
      ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}
      ${isInterim ? 'opacity-60' : ''}
    `}>
      <Avatar className={`
        w-8 h-8 border-2 
        ${message.isUser 
          ? 'border-voice-primary bg-voice-primary/10' 
          : 'border-voice-secondary bg-voice-secondary/10'
        }
      `}>
        <AvatarFallback className="bg-transparent">
          {message.isUser ? (
            <User size={16} className="text-voice-primary" />
          ) : (
            <Bot size={16} className="text-voice-secondary" />
          )}
        </AvatarFallback>
      </Avatar>
      
      <div className={`
        flex flex-col max-w-[80%]
        ${message.isUser ? 'items-end' : 'items-start'}
      `}>
        <Card className={`
          p-4 border-0 transition-all duration-300
          ${message.isUser 
            ? 'bg-gradient-voice text-white ml-auto' 
            : 'bg-card/80 backdrop-blur-sm'
          }
          ${isInterim ? 'listening-pulse' : ''}
        `}>
          <p className="text-sm leading-relaxed">
            {message.content}
            {isInterim && <span className="animate-pulse">|</span>}
          </p>
        </Card>
        
        <span className="text-xs text-muted-foreground mt-1 px-2">
          {format(message.timestamp, 'HH:mm')}
        </span>
      </div>
    </div>
  );
};
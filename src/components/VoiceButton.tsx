import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceButtonProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
}

export const VoiceButton = ({ isListening, onStartListening, onStopListening }: VoiceButtonProps) => {
  return (
    <Button
      onClick={isListening ? onStopListening : onStartListening}
      className={`
        relative w-20 h-20 rounded-full border-4 transition-all duration-300 ease-bounce
        ${isListening 
          ? 'bg-destructive hover:bg-destructive/90 border-destructive pulse-voice' 
          : 'bg-gradient-voice hover:opacity-90 border-voice-primary shadow-voice'
        }
        focus:outline-none focus:ring-4 focus:ring-voice-primary/30
      `}
      size="lg"
    >
      <div className={`
        transition-all duration-300 
        ${isListening ? 'scale-110' : 'scale-100'}
      `}>
        {isListening ? (
          <MicOff size={32} className="text-white" />
        ) : (
          <Mic size={32} className="text-white" />
        )}
      </div>
      
      {/* Ripple effect when listening */}
      {isListening && (
        <div className="absolute inset-0 rounded-full border-4 border-voice-glow animate-ping opacity-30" />
      )}
    </Button>
  );
};
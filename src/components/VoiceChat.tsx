import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { VoiceButton } from './VoiceButton';
import { MessageBubble } from './MessageBubble';
import { WaveVisualizer } from './WaveVisualizer';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const VoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your voice assistant. Press the microphone button to start talking!",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscript(interimTranscript);

        if (finalTranscript) {
          handleUserMessage(finalTranscript);
          setCurrentTranscript('');
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Speech Recognition Error",
          description: "Please check your microphone permissions and try again.",
          variant: "destructive"
        });
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: "Microphone Error",
          description: "Please allow microphone access to use voice chat.",
          variant: "destructive"
        });
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleUserMessage = (transcript: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: transcript,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    generateAIResponse(transcript);
  };

  const generateAIResponse = (userInput: string) => {
    // Simple AI responses - in a real app, this would call an AI service
    const responses = [
      "That's interesting! Tell me more about that.",
      "I understand what you're saying. How can I help you with that?",
      "Thanks for sharing that with me. What would you like to know?",
      "That sounds great! Is there anything specific you'd like to discuss?",
      "I'm here to help. What else would you like to talk about?",
      "That's a good point. Let me think about that for a moment.",
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (audioEnabled) {
        speakText(randomResponse);
      }
    }, 1000);
  };

  const speakText = (text: string) => {
    if (synthRef.current && audioEnabled) {
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-ambient flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto flex flex-col h-screen max-h-[800px]">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold bg-gradient-voice bg-clip-text text-transparent mb-2">
            Voice Assistant
          </h1>
          <p className="text-muted-foreground">
            {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Press the button to start talking'}
          </p>
        </div>

        {/* Messages Container */}
        <Card className="flex-1 bg-gradient-card backdrop-blur-sm border-border/50 mb-6 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {currentTranscript && (
                <MessageBubble 
                  message={{
                    id: 'interim',
                    content: currentTranscript,
                    isUser: true,
                    timestamp: new Date(),
                  }}
                  isInterim
                />
              )}
            </div>
          </div>
        </Card>

        {/* Voice Controls */}
        <div className="flex items-center justify-center space-x-6 pb-8">
          {/* Wave Visualizer */}
          <WaveVisualizer isActive={isListening || isSpeaking} />
          
          {/* Main Voice Button */}
          <VoiceButton
            isListening={isListening}
            onStartListening={startListening}
            onStopListening={stopListening}
          />
          
          {/* Audio Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleAudio}
            className={`rounded-full w-12 h-12 border-2 transition-all duration-300 ${
              audioEnabled 
                ? 'border-voice-primary text-voice-primary hover:bg-voice-primary/10' 
                : 'border-muted-foreground text-muted-foreground hover:bg-muted/10'
            }`}
          >
            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </Button>
        </div>
      </div>
    </div>
  );
};
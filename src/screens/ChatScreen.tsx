import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MoreVertical, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store/useStore';
import { sendMessage } from '@/services/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ChatScreen() {
  const navigate = useNavigate();
  const { userId, selectedCharacter, messages, addMessage, isTyping, setTyping, reset } = useStore();
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending || !userId) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    // Add user message
    addMessage({ content: userMessage, sender: 'user' });

    // Show typing indicator
    setTyping(true);

    // Send to API
    const response = await sendMessage({ userId, message: userMessage });

    // Hide typing indicator
    setTyping(false);

    // Add AI response
    if (response.success && response.data) {
      addMessage({ content: response.data.message, sender: 'ai' });
    } else {
      // Demo fallback response
      const fallbackResponses = [
        "That's really interesting! Tell me more about that.",
        "I love hearing your thoughts. What else is on your mind?",
        "You have such a unique perspective! How does that make you feel?",
        "I'm here for you. What would you like to talk about?",
      ];
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      addMessage({ content: randomResponse, sender: 'ai' });
    }

    setIsSending(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b border-border bg-card/80 backdrop-blur-lg sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">
              {selectedCharacter?.name || 'Your Companion'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>

        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleReset}>
              Start Over
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mb-6 shadow-glow animate-pulse-soft">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Start a conversation
            </h2>
            <p className="text-muted-foreground text-sm">
              Say hello to {selectedCharacter?.name || 'your companion'} and begin your journey together.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={`max-w-[80%] p-4 rounded-3xl ${
                message.sender === 'user'
                  ? 'gradient-primary text-primary-foreground rounded-br-lg'
                  : 'bg-card border border-border text-foreground rounded-bl-lg'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-card border border-border p-4 rounded-3xl rounded-bl-lg">
              <div className="flex gap-1.5">
                <span className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
                <span className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
                <span className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/80 backdrop-blur-lg">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 h-12 rounded-2xl bg-background border-border text-foreground px-5"
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="w-12 h-12 gradient-primary rounded-2xl shadow-soft hover:opacity-90 transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

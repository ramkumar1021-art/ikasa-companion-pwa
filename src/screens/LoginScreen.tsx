import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MessageCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { anonymousLogin } from '@/services/api';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { deviceId, setAuth, setOnboardingStep } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGuestLogin = async () => {
    if (!deviceId) return;
    
    setIsLoading(true);
    setError('');
    
    const response = await anonymousLogin(deviceId);
    
    if (response.success && response.data) {
      setAuth(response.data.userId, response.data.token);
      setOnboardingStep(1);
      navigate('/onboarding/profile');
    } else {
      setError(response.error || 'Failed to login. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 gradient-primary rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 gradient-secondary rounded-full opacity-20 blur-3xl" />
      </div>
      
      {/* Content */}
      <div className="w-full max-w-sm flex flex-col items-center z-10">
        {/* Logo */}
        <div className="animate-fade-up mb-8">
          <div className="w-24 h-24 gradient-primary rounded-3xl shadow-glow flex items-center justify-center">
            <MessageCircle className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>
        
        {/* Title */}
        <h1 className="animate-fade-up delay-100 text-4xl font-bold text-foreground mb-2">
          IKASA
        </h1>
        <p className="animate-fade-up delay-200 text-muted-foreground text-center mb-12">
          Your AI Companion for meaningful conversations
        </p>
        
        {/* Features */}
        <div className="animate-fade-up delay-300 w-full space-y-4 mb-12">
          <FeatureItem 
            icon={<Sparkles className="w-5 h-5" />}
            text="Personalized AI companions"
          />
          <FeatureItem 
            icon={<Heart className="w-5 h-5" />}
            text="Meaningful conversations"
          />
          <FeatureItem 
            icon={<MessageCircle className="w-5 h-5" />}
            text="Available 24/7"
          />
        </div>
        
        {/* Error message */}
        {error && (
          <p className="text-destructive text-sm mb-4 animate-fade-in">{error}</p>
        )}
        
        {/* CTA Button */}
        <Button
          onClick={handleGuestLogin}
          disabled={isLoading}
          className="animate-fade-up delay-400 w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-all shadow-soft hover:shadow-glow rounded-2xl"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Connecting...
            </span>
          ) : (
            'Continue as Guest'
          )}
        </Button>
        
        <p className="animate-fade-up delay-500 text-xs text-muted-foreground mt-4 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-4 p-4 glass-card rounded-2xl shadow-card">
      <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-primary-foreground">
        {icon}
      </div>
      <span className="text-foreground font-medium">{text}</span>
    </div>
  );
}

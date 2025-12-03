import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { saveStyle } from '@/services/api';
import { OnboardingLayout } from '@/components/OnboardingLayout';

const styleOptions = [
  {
    value: 'real' as const,
    title: 'Realistic',
    description: 'Photorealistic characters with lifelike appearances',
    icon: Sparkles,
    gradient: 'gradient-warm',
  },
  {
    value: 'anime' as const,
    title: 'Anime',
    description: 'Stylized anime-inspired characters',
    icon: Palette,
    gradient: 'gradient-secondary',
  },
];

export default function StyleScreen() {
  const navigate = useNavigate();
  const { setStyle, setOnboardingStep } = useStore();
  const [selectedStyle, setSelectedStyle] = useState<'real' | 'anime' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!selectedStyle) return;
    
    setIsLoading(true);
    setError('');
    
    const response = await saveStyle({ style: selectedStyle });
    
    if (response.success) {
      setStyle(selectedStyle);
      setOnboardingStep(3);
      navigate('/onboarding/character');
    } else {
      setError(response.error || 'Failed to save style. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <OnboardingLayout
      step={2}
      totalSteps={4}
      title="Choose your style"
      subtitle="Select the visual style you prefer"
    >
      <div className="space-y-6">
        {/* Style Options */}
        <div className="space-y-4">
          {styleOptions.map((option, index) => (
            <button
              key={option.value}
              onClick={() => setSelectedStyle(option.value)}
              className={`animate-fade-up w-full p-6 rounded-3xl border-2 transition-all duration-300 text-left ${
                selectedStyle === option.value
                  ? 'border-primary bg-primary/5 shadow-soft'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 ${option.gradient} rounded-2xl flex items-center justify-center shadow-soft`}>
                  <option.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {option.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {option.description}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedStyle === option.value
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30'
                }`}>
                  {selectedStyle === option.value && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-destructive text-sm animate-fade-in">{error}</p>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!selectedStyle || isLoading}
          className="animate-fade-up delay-200 w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-all shadow-soft rounded-2xl disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Continue
              <ChevronRight className="w-5 h-5" />
            </span>
          )}
        </Button>
      </div>
    </OnboardingLayout>
  );
}

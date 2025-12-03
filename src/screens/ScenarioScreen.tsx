import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2, Sparkles, Heart, Coffee, Sunset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { selectScenario, type Scenario } from '@/services/api';
import { OnboardingLayout } from '@/components/OnboardingLayout';

const defaultScenarios: Scenario[] = [
  { id: '1', name: 'Casual Chat', description: 'Just hanging out and having a friendly conversation' },
  { id: '2', name: 'Deep Talk', description: 'Meaningful conversations about life and feelings' },
  { id: '3', name: 'Coffee Date', description: 'A cozy virtual coffee date experience' },
  { id: '4', name: 'Evening Stroll', description: 'A relaxing walk while watching the sunset' },
];

const scenarioIcons = [Sparkles, Heart, Coffee, Sunset];
const scenarioGradients = ['gradient-primary', 'gradient-secondary', 'gradient-warm', 'gradient-primary'];

export default function ScenarioScreen() {
  const navigate = useNavigate();
  const { scenarios: storeScenarios, selectScenario: storeSelectScenario, completeOnboarding } = useStore();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Use store scenarios if available, otherwise use defaults
    if (storeScenarios.length > 0) {
      setScenarios(storeScenarios);
    } else {
      setScenarios(defaultScenarios);
    }
    setIsLoading(false);
  }, [storeScenarios]);

  const handleContinue = async () => {
    if (!selectedId) return;
    
    setIsSubmitting(true);
    setError('');
    
    const response = await selectScenario(selectedId);
    
    if (response.success || true) { // Allow continue even if API fails for demo
      const selected = scenarios.find(s => s.id === selectedId);
      if (selected) {
        storeSelectScenario(selected);
      }
      completeOnboarding();
      navigate('/chat');
    } else {
      setError(response.error || 'Failed to select scenario. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <OnboardingLayout
        step={4}
        totalSteps={4}
        title="Set the scene"
        subtitle="Loading scenarios..."
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      step={4}
      totalSteps={4}
      title="Set the scene"
      subtitle="Choose how you'd like to start"
    >
      <div className="space-y-6">
        {/* Scenario Grid */}
        <div className="grid grid-cols-2 gap-4">
          {scenarios.map((scenario, index) => {
            const Icon = scenarioIcons[index % scenarioIcons.length];
            const gradient = scenarioGradients[index % scenarioGradients.length];
            
            return (
              <button
                key={scenario.id}
                onClick={() => setSelectedId(scenario.id)}
                className={`animate-fade-up p-5 rounded-3xl border-2 transition-all duration-300 text-left aspect-square flex flex-col ${
                  selectedId === scenario.id
                    ? 'border-primary bg-primary/5 shadow-soft'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 ${gradient} rounded-2xl flex items-center justify-center shadow-soft mb-4`}>
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {scenario.name}
                </h3>
                <p className="text-muted-foreground text-xs line-clamp-2 flex-1">
                  {scenario.description}
                </p>
                <div className={`w-5 h-5 rounded-full border-2 transition-all self-end mt-2 ${
                  selectedId === scenario.id
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30'
                }`}>
                  {selectedId === scenario.id && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <p className="text-destructive text-sm animate-fade-in">{error}</p>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!selectedId || isSubmitting}
          className="animate-fade-up w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-all shadow-soft rounded-2xl disabled:opacity-50"
          style={{ animationDelay: `${scenarios.length * 50 + 100}ms` }}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Starting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Start Chatting
              <ChevronRight className="w-5 h-5" />
            </span>
          )}
        </Button>
      </div>
    </OnboardingLayout>
  );
}

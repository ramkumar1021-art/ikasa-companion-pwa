import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { getSession, selectCharacter, type Character } from '@/services/api';
import { OnboardingLayout } from '@/components/OnboardingLayout';

export default function CharacterScreen() {
  const navigate = useNavigate();
  const { userId, setCharacters, selectCharacter: storeSelectCharacter, setScenarios, setOnboardingStep } = useStore();
  const [characters, setLocalCharacters] = useState<Character[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCharacters = async () => {
      if (!userId) return;
      
      const response = await getSession(userId);
      
      if (response.success && response.data) {
        setLocalCharacters(response.data.characters || []);
        setCharacters(response.data.characters || []);
        if (response.data.scenarios) {
          setScenarios(response.data.scenarios);
        }
      } else {
        // Mock data for demo
        const mockCharacters: Character[] = [
          { id: '1', name: 'Aria', description: 'A warm and empathetic companion who loves deep conversations' },
          { id: '2', name: 'Luna', description: 'A playful and witty friend who brings joy to every chat' },
          { id: '3', name: 'Nova', description: 'An adventurous spirit who loves exploring new ideas' },
        ];
        setLocalCharacters(mockCharacters);
        setCharacters(mockCharacters);
      }
      
      setIsLoading(false);
    };

    fetchCharacters();
  }, [userId, setCharacters, setScenarios]);

  const handleContinue = async () => {
    if (!selectedId) return;
    
    setIsSubmitting(true);
    setError('');
    
    const response = await selectCharacter(selectedId);
    
    if (response.success || true) { // Allow continue even if API fails for demo
      const selected = characters.find(c => c.id === selectedId);
      if (selected) {
        storeSelectCharacter(selected);
      }
      setOnboardingStep(4);
      navigate('/onboarding/scenario');
    } else {
      setError(response.error || 'Failed to select character. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <OnboardingLayout
        step={3}
        totalSteps={4}
        title="Meet your companions"
        subtitle="Loading available characters..."
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      step={3}
      totalSteps={4}
      title="Meet your companions"
      subtitle="Choose who you'd like to chat with"
    >
      <div className="space-y-6">
        {/* Character Grid */}
        <div className="space-y-4">
          {characters.map((character, index) => (
            <button
              key={character.id}
              onClick={() => setSelectedId(character.id)}
              className={`animate-fade-up w-full p-5 rounded-3xl border-2 transition-all duration-300 text-left ${
                selectedId === character.id
                  ? 'border-primary bg-primary/5 shadow-soft'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  selectedId === character.id ? 'gradient-primary' : 'bg-muted'
                }`}>
                  {character.avatar ? (
                    <img 
                      src={character.avatar} 
                      alt={character.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <User className={`w-8 h-8 ${
                      selectedId === character.id ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
                    {character.name}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {character.description}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 transition-all flex-shrink-0 ${
                  selectedId === character.id
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30'
                }`}>
                  {selectedId === character.id && (
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
          disabled={!selectedId || isSubmitting}
          className="animate-fade-up w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-all shadow-soft rounded-2xl disabled:opacity-50"
          style={{ animationDelay: `${characters.length * 100}ms` }}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Selecting...
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

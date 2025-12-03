import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/store/useStore';
import { saveProfile } from '@/services/api';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { SelectCard } from '@/components/SelectCard';

const genderOptions = [
  { value: 'male', label: 'Male', emoji: '👨' },
  { value: 'female', label: 'Female', emoji: '👩' },
  { value: 'other', label: 'Other', emoji: '🧑' },
];

const preferredGenderOptions = [
  { value: 'male', label: 'Male', emoji: '👨' },
  { value: 'female', label: 'Female', emoji: '👩' },
  { value: 'any', label: 'Any', emoji: '✨' },
];

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { setProfile, setOnboardingStep } = useStore();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [preferredGender, setPreferredGender] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = name.trim().length >= 2 && gender && preferredGender;

  const handleContinue = async () => {
    if (!isValid) return;
    
    setIsLoading(true);
    setError('');
    
    const response = await saveProfile({ name, gender, preferredGender });
    
    if (response.success) {
      setProfile(name, gender, preferredGender);
      setOnboardingStep(2);
      navigate('/onboarding/style');
    } else {
      setError(response.error || 'Failed to save profile. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <OnboardingLayout
      step={1}
      totalSteps={4}
      title="Tell us about yourself"
      subtitle="Help us personalize your experience"
    >
      <div className="space-y-6">
        {/* Name Input */}
        <div className="space-y-2 animate-fade-up">
          <Label htmlFor="name" className="text-foreground font-medium">
            Your Name
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="pl-12 h-14 rounded-2xl bg-card border-border text-foreground"
            />
          </div>
        </div>

        {/* Gender Selection */}
        <div className="space-y-3 animate-fade-up delay-100">
          <Label className="text-foreground font-medium">Your Gender</Label>
          <div className="grid grid-cols-3 gap-3">
            {genderOptions.map((option) => (
              <SelectCard
                key={option.value}
                selected={gender === option.value}
                onClick={() => setGender(option.value)}
                emoji={option.emoji}
                label={option.label}
              />
            ))}
          </div>
        </div>

        {/* Preferred Gender Selection */}
        <div className="space-y-3 animate-fade-up delay-200">
          <Label className="text-foreground font-medium">Preferred Companion</Label>
          <div className="grid grid-cols-3 gap-3">
            {preferredGenderOptions.map((option) => (
              <SelectCard
                key={option.value}
                selected={preferredGender === option.value}
                onClick={() => setPreferredGender(option.value)}
                emoji={option.emoji}
                label={option.label}
              />
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-destructive text-sm animate-fade-in">{error}</p>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!isValid || isLoading}
          className="animate-fade-up delay-300 w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-all shadow-soft rounded-2xl disabled:opacity-50"
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

import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';

interface OnboardingLayoutProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function OnboardingLayout({ step, totalSteps, title, subtitle, children }: OnboardingLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col p-6 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 gradient-primary rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 gradient-secondary rounded-full opacity-10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        {/* Progress */}
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i < step ? 'w-8 gradient-primary' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>
        
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col z-10 max-w-md mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2 animate-fade-up">
            {title}
          </h1>
          <p className="text-muted-foreground animate-fade-up delay-100">
            {subtitle}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}

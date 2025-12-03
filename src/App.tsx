import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import LoginScreen from "./screens/LoginScreen";
import AuthScreen from "./screens/AuthScreen";
import ProfileScreen from "./screens/ProfileScreen";
import StyleScreen from "./screens/StyleScreen";
import CharacterScreen from "./screens/CharacterScreen";
import ScenarioScreen from "./screens/ScenarioScreen";
import ChatScreen from "./screens/ChatScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Auth protected route wrapper
function AuthRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Onboarding route wrapper - requires auth and checks onboarding step
function OnboardingRoute({ children, minStep }: { children: React.ReactNode; minStep: number }) {
  const { onboardingStep, onboardingComplete } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (onboardingComplete) {
    return <Navigate to="/chat" replace />;
  }

  if (onboardingStep < minStep) {
    return <Navigate to="/onboarding/profile" replace />;
  }

  return <>{children}</>;
}

// Protected route wrapper - requires auth and completed onboarding
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { onboardingComplete } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!onboardingComplete) {
    return <Navigate to="/onboarding/profile" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginScreen />} />
          <Route path="/auth" element={<AuthScreen />} />
          
          {/* Onboarding Flow - requires auth */}
          <Route 
            path="/onboarding/profile" 
            element={
              <OnboardingRoute minStep={1}>
                <ProfileScreen />
              </OnboardingRoute>
            } 
          />
          <Route 
            path="/onboarding/style" 
            element={
              <OnboardingRoute minStep={2}>
                <StyleScreen />
              </OnboardingRoute>
            } 
          />
          <Route 
            path="/onboarding/character" 
            element={
              <OnboardingRoute minStep={3}>
                <CharacterScreen />
              </OnboardingRoute>
            } 
          />
          <Route 
            path="/onboarding/scenario" 
            element={
              <OnboardingRoute minStep={4}>
                <ScenarioScreen />
              </OnboardingRoute>
            } 
          />
          
          {/* Chat - requires completed onboarding */}
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatScreen />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

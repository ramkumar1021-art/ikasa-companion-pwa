import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import LoginScreen from "./screens/LoginScreen";
import ProfileScreen from "./screens/ProfileScreen";
import StyleScreen from "./screens/StyleScreen";
import CharacterScreen from "./screens/CharacterScreen";
import ScenarioScreen from "./screens/ScenarioScreen";
import ChatScreen from "./screens/ChatScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children, requiresOnboarding = true }: { children: React.ReactNode; requiresOnboarding?: boolean }) {
  const { onboardingComplete, userId } = useStore();
  
  if (requiresOnboarding && !onboardingComplete) {
    return <Navigate to="/" replace />;
  }
  
  if (!requiresOnboarding && !userId) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Onboarding route wrapper
function OnboardingRoute({ children, minStep }: { children: React.ReactNode; minStep: number }) {
  const { onboardingStep, onboardingComplete } = useStore();
  
  if (onboardingComplete) {
    return <Navigate to="/chat" replace />;
  }
  
  if (onboardingStep < minStep) {
    return <Navigate to="/" replace />;
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
          {/* Login */}
          <Route path="/" element={<LoginScreen />} />
          
          {/* Onboarding Flow */}
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
              <ProtectedRoute requiresOnboarding={true}>
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

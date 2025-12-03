import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Chrome, Eye, EyeOff, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number with country code');

type AuthMode = 'signin' | 'signup';

export default function AuthScreen() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [activeTab, setActiveTab] = useState('email');
  
  // Email auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Phone auth state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; phone?: string }>({});

  const validateEmail = () => {
    try {
      emailSchema.parse(email);
      setErrors(prev => ({ ...prev, email: undefined }));
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, email: e.errors[0].message }));
      }
      return false;
    }
  };

  const validatePassword = () => {
    try {
      passwordSchema.parse(password);
      setErrors(prev => ({ ...prev, password: undefined }));
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, password: e.errors[0].message }));
      }
      return false;
    }
  };

  const validatePhone = () => {
    try {
      phoneSchema.parse(phone);
      setErrors(prev => ({ ...prev, phone: undefined }));
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, phone: e.errors[0].message }));
      }
      return false;
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/onboarding/profile`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in with Google',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!validateEmail() || !validatePassword()) return;
    
    setIsLoading(true);
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding/profile`,
          },
        });
        if (error) throw error;
        toast({
          title: 'Account created!',
          description: 'You can now continue to setup your profile.',
        });
        navigate('/onboarding/profile');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/onboarding/profile');
      }
    } catch (error: any) {
      let message = error.message || 'Authentication failed';
      if (error.message?.includes('Invalid login credentials')) {
        message = 'Invalid email or password';
      } else if (error.message?.includes('User already registered')) {
        message = 'An account with this email already exists. Please sign in instead.';
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!validatePhone()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      if (error) throw error;
      setOtpSent(true);
      toast({
        title: 'OTP Sent!',
        description: 'Check your phone for the verification code.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter the OTP code',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;
      navigate('/onboarding/profile');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Invalid OTP code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 gradient-primary rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 gradient-secondary rounded-full opacity-20 blur-3xl" />
      </div>

      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 rounded-xl z-10"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full max-w-sm mx-auto">
        {/* Logo */}
        <div className="animate-fade-up mb-6">
          <div className="w-16 h-16 gradient-primary rounded-2xl shadow-glow flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        
        <h1 className="animate-fade-up delay-100 text-2xl font-bold text-foreground mb-2">
          {authMode === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="animate-fade-up delay-200 text-muted-foreground text-center mb-8">
          {authMode === 'signin' ? 'Sign in to continue your journey' : 'Join IKASA to start chatting'}
        </p>

        {/* Auth Methods */}
        <div className="animate-fade-up delay-300 w-full space-y-6">
          {/* Google Sign In */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            variant="outline"
            className="w-full h-14 text-base font-medium rounded-2xl border-2 hover:bg-muted transition-all"
          >
            <Chrome className="w-5 h-5 mr-3" />
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">or continue with</span>
            </div>
          </div>

          {/* Tabs for Email/Phone */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 rounded-2xl bg-muted p-1">
              <TabsTrigger value="email" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Phone className="w-4 h-4 mr-2" />
                Phone
              </TabsTrigger>
            </TabsList>

            {/* Email Tab */}
            <TabsContent value="email" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={validateEmail}
                  placeholder="you@example.com"
                  className="h-12 rounded-xl bg-card border-border"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={validatePassword}
                    placeholder="••••••••"
                    className="h-12 rounded-xl bg-card border-border pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
              <Button
                onClick={handleEmailAuth}
                disabled={isLoading}
                className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-all shadow-soft rounded-2xl"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {authMode === 'signin' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  authMode === 'signin' ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </TabsContent>

            {/* Phone Tab */}
            <TabsContent value="phone" className="mt-4 space-y-4">
              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={validatePhone}
                      placeholder="+1234567890"
                      className="h-12 rounded-xl bg-card border-border"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Include your country code (e.g., +1 for US)
                    </p>
                  </div>
                  <Button
                    onClick={handleSendOTP}
                    disabled={isLoading}
                    className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-all shadow-soft rounded-2xl"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="h-12 rounded-xl bg-card border-border text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Code sent to {phone}
                    </p>
                  </div>
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={isLoading}
                    className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-all shadow-soft rounded-2xl"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      'Verify & Continue'
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setOtpSent(false)}
                    className="w-full"
                  >
                    Use different number
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* Toggle Auth Mode */}
          <p className="text-center text-sm text-muted-foreground">
            {authMode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthMode('signup')}
                  className="text-primary font-medium hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setAuthMode('signin')}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

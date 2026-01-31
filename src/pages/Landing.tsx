import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-travel.jpg";
import { MapPin, Compass, Plane, User, Mail, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = () => {
    // Handle login logic here
    console.log("Login with:", email, password);
  };

  const handleSignUp = () => {
    // Handle sign up logic here
    console.log("Sign up with:", email, password, confirmPassword);
  };

  const handleSocialLogin = (provider: string) => {
    // Handle social login logic here
    console.log("Login with:", provider);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Login Button - Top Right */}
        <div className="absolute top-6 right-6 z-20">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full bg-background/20 backdrop-blur-sm border-white/20 hover:bg-background/30 transition-all"
              >
                <User className="w-5 h-5 text-foreground" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold">
                  {isSignUp ? "Join VibeVoyage" : "Welcome to VibeVoyage"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Email and Password Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}
                  <Button onClick={isSignUp ? handleSignUp : handleLogin} className="w-full">
                    {isSignUp ? "Create Account" : "Sign In"}
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                {/* Social Login Options */}
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={() => handleSocialLogin('google')}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={() => handleSocialLogin('microsoft')}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#F25022" d="M1 1h10v10H1z"/>
                      <path fill="#00A4EF" d="M13 1h10v10H13z"/>
                      <path fill="#7FBA00" d="M1 13h10v10H1z"/>
                      <path fill="#FFB900" d="M13 13h10v10H13z"/>
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={() => handleSocialLogin('apple')}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </Button>
                </div>

                {/* Toggle Sign In/Sign Up */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                  </span>
                  <Button variant="link" className="p-0 h-auto font-semibold" onClick={toggleMode}>
                    {isSignUp ? "Sign in" : "Sign up"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="p-3 rounded-full bg-primary/10 backdrop-blur-sm">
              <Compass className="w-14 h-14 text-primary" />
            </div>
          </div>

          {/* Brand Name */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="text-4xl md:text-5xl font-bold text-foreground">VibeVoyage</span>
          </div>

          {/* Decorative Icons */}
          <div className="flex justify-center gap-6 mb-8 opacity-60">
            <MapPin className="w-5 h-5 text-teal animate-pulse-soft" />
            <Plane className="w-5 h-5 text-ocean" style={{ animationDelay: '0.5s' }} />
            <MapPin className="w-5 h-5 text-teal animate-pulse-soft" style={{ animationDelay: '1s' }} />
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Plan your perfect trip
            <br />
            <span className="text-primary">in minutes</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            AI-powered itinerary planning based on your vibe.
            <br className="hidden md:block" />
            No clutter, no stress — just your perfect adventure.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button 
              size="lg" 
              onClick={() => navigate('/create')}
              className="px-8 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Create My Trip
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/sample')}
              className="px-8 py-6 text-lg rounded-2xl border-2 hover:bg-accent transition-all"
            >
              View Sample Itinerary
            </Button>
          </div>

          {/* Trust Indicator */}
          <p className="mt-12 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.8s' }}>
            ✨ Free to use • No account required • Powered by AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;

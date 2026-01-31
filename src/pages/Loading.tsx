import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";

const loadingMessages = [
  "Understanding your travel vibe…",
  "Consulting AI travel expert…",
  "Discovering hidden gems…",
  "Optimizing routes with AI…",
  "Balancing budget and experiences…",
  "Crafting your perfect itinerary…",
];

const Loading = () => {
  const navigate = useNavigate();
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateItinerary = async () => {
      try {
        // Get trip data from localStorage
        const tripDataString = localStorage.getItem('tripData');
        if (!tripDataString) {
          console.log('❌ No trip data found in localStorage');
          navigate('/create');
          return;
        }

        const tripData = JSON.parse(tripDataString);
        console.log('📤 Generating itinerary with data:', tripData);

        // Start progress and message cycling
        const messageInterval = setInterval(() => {
          setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2000);

        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) return 90; // Keep at 90% until API responds
            return prev + 3;
          });
        }, 200);

        // Call the AI API
        const response = await fetch('http://localhost:5000/api/itinerary/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tripData),
        });

        console.log('📥 API Response status:', response.status);
        const result = await response.json();
        console.log('📥 API Response success:', result.success);

        if (result.success) {
          // Complete progress
          setProgress(100);
          
          // Store the generated itinerary
          localStorage.setItem('generatedItinerary', JSON.stringify(result.data));
          console.log('✅ Itinerary stored successfully:', result.data.tripSummary.destination);
          
          // Navigate to itinerary page after a brief delay
          setTimeout(() => {
            navigate('/itinerary');
          }, 1000);
        } else {
          throw new Error(result.message || 'Failed to generate itinerary');
        }

        clearInterval(messageInterval);
        clearInterval(progressInterval);

      } catch (error) {
        console.error('❌ Error generating itinerary:', error);
        
        let errorMessage = 'Something went wrong while generating your itinerary';
        
        if (error.message.includes('AI service temporarily unavailable')) {
          errorMessage = 'AI service is temporarily unavailable. Please try again in a moment.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to our servers. Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'The request took too long. Please try again with a shorter trip.';
        }
        
        console.log('🔄 Redirecting to sample itinerary due to error');
        setError(errorMessage);
        
        // Navigate to sample itinerary as fallback after showing error
        setTimeout(() => {
          navigate('/sample');
        }, 4000);
      }
    };

    generateItinerary();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6 max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Oops! Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Redirecting to sample itinerary...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-6 max-w-md">
        {/* Animated Map SVG */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Background circle */}
            <circle 
              cx="100" 
              cy="100" 
              r="80" 
              fill="none" 
              stroke="hsl(var(--muted))" 
              strokeWidth="2"
            />
            
            {/* Animated path */}
            <path
              d="M 40 100 Q 70 60, 100 80 T 160 100 Q 140 140, 100 120 T 40 100"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="500"
              className="animate-draw-line"
            />
            
            {/* Location pins */}
            <g className="animate-pulse-soft">
              <circle cx="60" cy="85" r="8" fill="hsl(var(--primary))" />
              <circle cx="60" cy="85" r="4" fill="hsl(var(--primary-foreground))" />
            </g>
            <g className="animate-pulse-soft" style={{ animationDelay: '0.5s' }}>
              <circle cx="100" cy="100" r="8" fill="hsl(var(--teal))" />
              <circle cx="100" cy="100" r="4" fill="hsl(var(--primary-foreground))" />
            </g>
            <g className="animate-pulse-soft" style={{ animationDelay: '1s' }}>
              <circle cx="145" cy="95" r="8" fill="hsl(var(--ocean))" />
              <circle cx="145" cy="95" r="4" fill="hsl(var(--primary-foreground))" />
            </g>
          </svg>

          {/* Center compass */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-4 rounded-full bg-card shadow-lg">
              <Compass className="w-8 h-8 text-primary animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
        </div>

        {/* Loading message */}
        <p className="text-xl font-medium text-foreground mb-4 h-8 transition-all duration-300">
          {loadingMessages[messageIndex]}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Reassuring text */}
        <p className="text-sm text-muted-foreground mt-6">
          Our AI is working its magic ✨
        </p>
      </div>
    </div>
  );
};

export default Loading;

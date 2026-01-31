import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { 
  MapPin, CalendarDays, Wallet, Heart, Compass, 
  ArrowLeft, ArrowRight, Sparkles, Mountain, 
  Utensils, TreePine, ShoppingBag, Palmtree, 
  Zap, Soup, Loader2, Camera, History, 
  Music, Waves, Coffee, Users, Plane, Train
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_ENDPOINTS, apiCall } from "@/lib/api";
import ApiHealthCheck from "@/components/ApiHealthCheck";

const allInterests = [
  { id: "culture", label: "Culture", icon: Compass },
  { id: "food", label: "Food", icon: Utensils },
  { id: "adventure", label: "Adventure", icon: Mountain },
  { id: "nature", label: "Nature", icon: TreePine },
  { id: "history", label: "History", icon: History },
  { id: "nightlife", label: "Nightlife", icon: Music },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "relaxation", label: "Relaxation", icon: Palmtree },
  { id: "photography", label: "Photography", icon: Camera },
  { id: "local-experience", label: "Local Experience", icon: Users },
];

const vibes = [
  { id: "chill", label: "Chill", emoji: "🌴", icon: Palmtree },
  { id: "explorer", label: "Explorer", emoji: "🧭", icon: Compass },
  { id: "adventure", label: "Adventure", emoji: "⚡", icon: Zap },
  { id: "foodie", label: "Foodie", emoji: "🍜", icon: Soup },
];

const transportModes = [
  { id: "flight", label: "Flight", icon: Plane, emoji: "✈️" },
  { id: "train", label: "Train", icon: Train, emoji: "🚄" },
];

interface DestinationInfo {
  suggestedInterests: string[];
  destinationInfo: {
    bestTimeToVisit: string;
    averageBudgetPerDay: number;
    topAttractions: string[];
    localCurrency: string;
    language: string;
    timeZone: string;
  };
}

const CreateTrip = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [budget, setBudget] = useState([50]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedVibe, setSelectedVibe] = useState("");
  const [transportMode, setTransportMode] = useState("flight");
  const [destinationInfo, setDestinationInfo] = useState<DestinationInfo | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);

  // Check if we're editing an existing trip
  useEffect(() => {
    const editingData = localStorage.getItem('editingTripData');
    if (editingData) {
      try {
        const tripData = JSON.parse(editingData);
        setDestination(tripData.destination);
        setDateRange({
          from: new Date(tripData.startDate),
          to: new Date(tripData.endDate)
        });
        setBudget([Math.round((tripData.budget / (tripData.averageBudgetPerDay || 100)) * 100)]);
        setSelectedInterests(tripData.interests);
        setSelectedVibe(tripData.travelVibe);
        setTransportMode(tripData.transportMode || 'flight');
        // Clear the editing data
        localStorage.removeItem('editingTripData');
      } catch (error) {
        console.error('Error loading editing data:', error);
      }
    }
  }, []);

  // Get AI suggestions when destination changes
  useEffect(() => {
    const getDestinationSuggestions = async () => {
      if (destination.length < 3) {
        setDestinationInfo(null);
        setSuggestionsLoaded(false);
        // Clear selected interests when destination is too short
        setSelectedInterests([]);
        return;
      }

      setLoadingSuggestions(true);
      try {
        console.log('🔍 Fetching suggestions for:', destination);
        const data = await apiCall(API_ENDPOINTS.DESTINATION_SUGGESTIONS, {
          method: 'POST',
          body: JSON.stringify({ destination }),
        });

        console.log('📥 Received suggestions:', data);
        if (data.success) {
          setDestinationInfo(data.data);
          setSuggestionsLoaded(true);
          // Auto-select suggested interests
          const suggestedInterests = data.data.suggestedInterests || [];
          console.log('🎯 Auto-selecting interests:', suggestedInterests);
          setSelectedInterests(suggestedInterests);
        }
      } catch (error) {
        console.error('❌ Error getting destination suggestions:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const timeoutId = setTimeout(getDestinationSuggestions, 1000);
    return () => clearTimeout(timeoutId);
  }, [destination]);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getBudgetLabel = () => {
    if (budget[0] < 33) return "Budget-Friendly";
    if (budget[0] < 66) return "Moderate";
    return "Luxury";
  };

  const canProceed = () => {
    if (step === 1) return destination.length > 0 && dateRange?.from && dateRange?.to;
    if (step === 2) return selectedInterests.length > 0;
    if (step === 3) return selectedVibe.length > 0;
    return false;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      // Generate itinerary with AI
      generateItinerary();
    }
  };

  const generateItinerary = async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    const itineraryData = {
      destination,
      startDate: format(dateRange.from, 'yyyy-MM-dd'),
      endDate: format(dateRange.to, 'yyyy-MM-dd'),
      budget: Math.round((budget[0] / 100) * (destinationInfo?.destinationInfo.averageBudgetPerDay || 100) * 
        Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1),
      interests: selectedInterests,
      travelVibe: selectedVibe,
      transportMode: transportMode
    };

    console.log('💾 Storing trip data:', itineraryData);
    // Store data for the loading page
    localStorage.setItem('tripData', JSON.stringify(itineraryData));
    console.log('✅ Trip data stored successfully');
    navigate('/loading');
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">VibeVoyage</span>
          </div>
          <div className="w-20" />
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                s === step ? "w-8 bg-primary" : s < step ? "w-8 bg-primary/50" : "w-8 bg-muted"
              )}
            />
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">Step {step} of 3</p>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 max-w-2xl">
        {/* API Health Check - Only show in development */}
        {import.meta.env.DEV && <ApiHealthCheck />}
        
        {/* Step 1: Destination & Dates */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Where to?</h2>
              <p className="text-muted-foreground">Tell us your destination and travel dates</p>
            </div>

            <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
              <div className="space-y-6">
                {/* Destination */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    Destination
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Search for a city or country..."
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="rounded-xl h-12 border-border/50 focus:border-primary pr-10"
                    />
                    {loadingSuggestions && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  
                  {/* AI Destination Info */}
                  {destinationInfo && suggestionsLoaded && (
                    <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20 animate-fade-in">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-sm font-medium text-primary">AI Insights for {destination}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Best Time:</span>
                          <span className="ml-2 font-medium">{destinationInfo.destinationInfo.bestTimeToVisit}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Budget/Day:</span>
                          <span className="ml-2 font-medium">${destinationInfo.destinationInfo.averageBudgetPerDay}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-muted-foreground">Suggested Interests:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {destinationInfo.suggestedInterests.map((interest, index) => (
                              <Badge key={index} variant="default" className="text-xs bg-primary/20 text-primary border-primary/30">
                                ✨ {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-muted-foreground">Top Attractions:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {destinationInfo.destinationInfo.topAttractions.map((attraction, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {attraction}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date Range */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    Travel Dates
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 rounded-xl border-border/50",
                          !dateRange?.from && "text-muted-foreground"
                        )}
                      >
                        {dateRange?.from ? (
                          dateRange?.to ? (
                            <>
                              {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                            </>
                          ) : (
                            format(dateRange.from, "MMM d, yyyy")
                          )
                        ) : (
                          "Select your travel dates"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Budget */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <Wallet className="w-4 h-4 text-primary" />
                    Budget
                  </label>
                  <div className="px-2">
                    <Slider
                      value={budget}
                      onValueChange={setBudget}
                      max={100}
                      step={1}
                      className="py-4"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>Low</span>
                      <span className="font-medium text-primary">{getBudgetLabel()}</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                {/* Transportation Mode */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <Plane className="w-4 h-4 text-primary" />
                    Transportation
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {transportModes.map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = transportMode === mode.id;
                      return (
                        <Card
                          key={mode.id}
                          onClick={() => setTransportMode(mode.id)}
                          className={cn(
                            "p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-sm",
                            isSelected 
                              ? "bg-primary/10 border-primary/30 shadow-sm" 
                              : "border-border/50 hover:border-primary/20"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg transition-colors",
                              isSelected ? "bg-primary/20" : "bg-muted"
                            )}>
                              <Icon className={cn(
                                "w-4 h-4",
                                isSelected ? "text-primary" : "text-muted-foreground"
                              )} />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{mode.emoji}</span>
                              <span className={cn(
                                "font-medium text-sm",
                                isSelected ? "text-primary" : "text-foreground"
                              )}>
                                {mode.label}
                              </span>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">What interests you?</h2>
              <p className="text-muted-foreground">
                {suggestionsLoaded ? "AI has pre-selected interests based on your destination" : "Select all that apply"}
              </p>
              {suggestionsLoaded && (
                <div className="mt-2 flex items-center justify-center gap-2 text-sm text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span>Powered by AI for {destination}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {allInterests.map((interest) => {
                const Icon = interest.icon;
                const isSelected = selectedInterests.includes(interest.id);
                const isAISuggested = destinationInfo?.suggestedInterests.includes(interest.id);
                return (
                  <Card
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={cn(
                      "p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md relative",
                      isSelected 
                        ? "bg-primary/10 border-primary/30 shadow-sm" 
                        : "border-border/50 hover:border-primary/20"
                    )}
                  >
                    {isAISuggested && (
                      <div className="absolute -top-1 -right-1">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Sparkles className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-xl transition-colors",
                        isSelected ? "bg-primary/20" : "bg-muted"
                      )}>
                        <Icon className={cn(
                          "w-6 h-6",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <span className={cn(
                        "font-medium text-sm text-center",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {interest.label}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Vibe */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">What's your travel vibe?</h2>
              <p className="text-muted-foreground">This helps us craft the perfect itinerary</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {vibes.map((vibe) => {
                const Icon = vibe.icon;
                const isSelected = selectedVibe === vibe.id;
                return (
                  <Card
                    key={vibe.id}
                    onClick={() => setSelectedVibe(vibe.id)}
                    className={cn(
                      "p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md",
                      isSelected 
                        ? "bg-primary/10 border-primary/30 shadow-sm" 
                        : "border-border/50 hover:border-primary/20"
                    )}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-3xl">{vibe.emoji}</span>
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        isSelected ? "bg-primary/20" : "bg-muted"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <span className={cn(
                        "font-medium",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {vibe.label}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="mt-8 pb-8">
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full h-14 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            {step === 3 ? (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate AI Itinerary
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;

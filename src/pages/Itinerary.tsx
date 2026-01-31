import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MapPin, Clock, Utensils, Camera, Bus, 
  Compass, RefreshCw, Settings, Download, Share2,
  Map, ChevronRight, Home, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_ENDPOINTS } from "@/lib/api";
import BudgetBreakdown from "@/components/BudgetBreakdown";
import BottomNav from "@/components/BottomNav";
import GoogleMap from "@/components/GoogleMap";

interface Activity {
  name: string;
  description: string;
  duration: number;
  estimatedCost: number;
  category: string;
  startTime: string;
  endTime: string;
}

interface DayItinerary {
  dayNumber: number;
  date: string;
  activities: Activity[];
}

interface GeneratedItinerary {
  id: string;
  tripSummary: {
    destination: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    budget: number;
    interests: string[];
    travelVibe: string;
    transportMode?: string;
  };
  dailyItinerary: DayItinerary[];
  budgetBreakdown: any;
}

const sampleItinerary = {
  destination: "Bali, Indonesia",
  dates: "Mar 15 - Mar 20, 2024",
  days: [
    {
      day: 1,
      date: "Mar 15",
      title: "Arrival & Ubud Vibes",
      activities: [
        { time: "10:00 AM", place: "Ngurah Rai Airport", description: "Arrival & private transfer to Ubud", icon: "travel" },
        { time: "1:00 PM", place: "Locavore", description: "Farm-to-table lunch experience", icon: "food" },
        { time: "3:00 PM", place: "Tegallalang Rice Terraces", description: "Iconic green terraces with swing", icon: "sightseeing" },
        { time: "6:00 PM", place: "Ubud Palace", description: "Traditional Balinese dance performance", icon: "sightseeing" },
      ],
    },
    {
      day: 2,
      date: "Mar 16",
      title: "Temple & Waterfall Day",
      activities: [
        { time: "6:00 AM", place: "Tirta Empul Temple", description: "Sacred water purification ceremony", icon: "sightseeing" },
        { time: "10:00 AM", place: "Tegenungan Waterfall", description: "Refreshing swim in jungle waterfall", icon: "sightseeing" },
        { time: "1:00 PM", place: "Bebek Bengil", description: "Famous crispy duck restaurant", icon: "food" },
        { time: "4:00 PM", place: "Monkey Forest", description: "Walk through ancient temple forest", icon: "sightseeing" },
      ],
    },
    {
      day: 3,
      date: "Mar 17",
      title: "Beach Day in Seminyak",
      activities: [
        { time: "9:00 AM", place: "Transfer to Seminyak", description: "1-hour scenic drive to coast", icon: "travel" },
        { time: "11:00 AM", place: "Ku De Ta Beach Club", description: "Beach lounging & cocktails", icon: "food" },
        { time: "2:00 PM", place: "Seminyak Beach", description: "Surfing lesson for beginners", icon: "sightseeing" },
        { time: "6:00 PM", place: "La Lucciola", description: "Sunset dinner on the beach", icon: "food" },
      ],
    },
  ],
};

const getActivityIcon = (category: string) => {
  switch (category) {
    case "food": return Utensils;
    case "transport": return Bus;
    case "activity": return Camera;
    default: return MapPin;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};

const Itinerary = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'map' | 'budget'>('itinerary');
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);

  useEffect(() => {
    // Load the generated itinerary from localStorage
    const loadItinerary = () => {
      try {
        const storedItinerary = localStorage.getItem('generatedItinerary');
        if (storedItinerary) {
          const parsedItinerary = JSON.parse(storedItinerary);
          setItinerary(parsedItinerary);
          console.log('✅ Loaded generated itinerary:', parsedItinerary.tripSummary.destination);
        } else {
          console.log('⚠️ No generated itinerary found, using sample data');
          // If no generated itinerary, redirect to sample
          navigate('/sample');
          return;
        }
      } catch (error) {
        console.error('❌ Error loading itinerary:', error);
        navigate('/sample');
        return;
      }
      setLoading(false);
    };

    loadItinerary();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No itinerary found</p>
          <Button onClick={() => navigate('/create')}>Create New Trip</Button>
        </div>
      </div>
    );
  }

  const currentDayData = itinerary.dailyItinerary.find(d => d.dayNumber === selectedDay);
  const destination = itinerary.tripSummary.destination;
  const dateRange = formatDateRange(itinerary.tripSummary.startDate, itinerary.tripSummary.endDate);

  const handleRegenerateDay = async () => {
    if (!itinerary || regeneratingDay) return;
    
    setRegeneratingDay(selectedDay);
    try {
      const response = await fetch(API_ENDPOINTS.REGENERATE_DAY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itineraryId: itinerary.id,
          dayNumber: selectedDay,
          preferences: {
            moreFood: false,
            lessActivities: false,
            moreOutdoor: false,
            moreCultural: false
          }
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Update the itinerary with the new day data
        const updatedItinerary = { ...itinerary };
        const dayIndex = updatedItinerary.dailyItinerary.findIndex(d => d.dayNumber === selectedDay);
        if (dayIndex !== -1) {
          updatedItinerary.dailyItinerary[dayIndex] = result.data.updatedDay;
          setItinerary(updatedItinerary);
          // Update localStorage
          localStorage.setItem('generatedItinerary', JSON.stringify(updatedItinerary));
        }
      } else {
        console.error('Failed to regenerate day:', result.message);
        alert('Failed to regenerate day. Please try again.');
      }
    } catch (error) {
      console.error('Error regenerating day:', error);
      alert('Error regenerating day. Please try again.');
    } finally {
      setRegeneratingDay(null);
    }
  };

  const handleDownloadPDF = () => {
    // Create a simple text version for download
    const itineraryText = `
VibeVoyage Itinerary
${destination}
${dateRange}

${itinerary.dailyItinerary.map(day => `
Day ${day.dayNumber} - ${formatDate(day.date)}
${day.activities.map(activity => `
  ${activity.startTime} - ${activity.endTime}: ${activity.name}
  ${activity.description}
  Duration: ${activity.duration} minutes | Cost: $${activity.estimatedCost}
`).join('')}
`).join('')}

Total Budget: $${itinerary.tripSummary.budget}
Generated by VibeVoyage AI
    `.trim();

    const blob = new Blob([itineraryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${destination.replace(/[^a-zA-Z0-9]/g, '_')}_itinerary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEditPreferences = () => {
    // Navigate back to create trip with current data pre-filled
    const tripData = {
      destination: itinerary.tripSummary.destination,
      startDate: itinerary.tripSummary.startDate,
      endDate: itinerary.tripSummary.endDate,
      budget: itinerary.tripSummary.budget,
      interests: itinerary.tripSummary.interests,
      travelVibe: itinerary.tripSummary.travelVibe,
      transportMode: itinerary.tripSummary.transportMode || 'flight'
    };
    localStorage.setItem('editingTripData', JSON.stringify(tripData));
    navigate('/create');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">VibeVoyage</span>
            </div>
            <Button variant="ghost" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Trip Header */}
      <div className="bg-gradient-to-b from-sky/30 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-1">{destination}</h1>
            <p className="text-muted-foreground">{dateRange}</p>
            <div className="mt-2 flex items-center justify-center gap-4 text-sm">
              <span className="text-primary flex items-center gap-1">
                <span>✨</span>
                <span>AI-Generated Itinerary</span>
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground flex items-center gap-1">
                <span>{itinerary.tripSummary.transportMode === 'train' ? '🚄' : '✈️'}</span>
                <span>{itinerary.tripSummary.transportMode === 'train' ? 'Train Routes' : 'Flight Routes'}</span>
              </span>
            </div>
          </div>

          {/* Tab Switcher for Mobile */}
          <div className="flex justify-center gap-2 mt-6 md:hidden">
            {(['itinerary', 'map', 'budget'] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className="rounded-full capitalize"
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Day Selector - Desktop Sidebar */}
          <div className="hidden lg:block lg:w-48 shrink-0">
            <div className="sticky top-24 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Days</h3>
              {itinerary.dailyItinerary.map((day) => (
                <Card
                  key={day.dayNumber}
                  onClick={() => setSelectedDay(day.dayNumber)}
                  className={cn(
                    "p-4 cursor-pointer transition-all rounded-xl",
                    selectedDay === day.dayNumber 
                      ? "bg-primary/10 border-primary/30" 
                      : "hover:bg-muted/50 border-border/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn(
                        "font-semibold",
                        selectedDay === day.dayNumber ? "text-primary" : "text-foreground"
                      )}>
                        Day {day.dayNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">{formatDate(day.date)}</p>
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform",
                      selectedDay === day.dayNumber ? "text-primary translate-x-1" : "text-muted-foreground"
                    )} />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Mobile Day Selector */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {itinerary.dailyItinerary.map((day) => (
              <Button
                key={day.dayNumber}
                variant={selectedDay === day.dayNumber ? "default" : "outline"}
                onClick={() => setSelectedDay(day.dayNumber)}
                className="rounded-full shrink-0"
              >
                Day {day.dayNumber}
              </Button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-2xl">
            {(activeTab === 'itinerary' || window.innerWidth >= 1024) && (
              <>
                {/* Day Title */}
                {currentDayData && (
                  <div className="mb-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-foreground">Day {currentDayData.dayNumber}</h2>
                    <p className="text-muted-foreground">{formatDate(currentDayData.date)} • {currentDayData.activities.length} activities</p>
                  </div>
                )}

                {/* Activities */}
                <div className="space-y-4">
                  {currentDayData?.activities.map((activity, index) => {
                    const Icon = getActivityIcon(activity.category);
                    return (
                      <Card 
                        key={index} 
                        className="p-4 rounded-2xl border-border/50 hover:shadow-md transition-all animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex gap-4">
                          <div className="shrink-0">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              activity.category === "food" ? "bg-orange-100 text-orange-600" :
                              activity.category === "transport" ? "bg-blue-100 text-blue-600" :
                              "bg-primary/10 text-primary"
                            )}>
                              <Icon className="w-5 h-5" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <Clock className="w-3 h-3" />
                              {activity.startTime} - {activity.endTime}
                            </div>
                            <h3 className="font-semibold text-foreground">{activity.name}</h3>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm text-muted-foreground">
                                {activity.duration} minutes
                              </span>
                              <span className="text-sm font-medium text-primary">
                                ${activity.estimatedCost}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-8">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full"
                    onClick={handleRegenerateDay}
                    disabled={regeneratingDay === selectedDay}
                  >
                    {regeneratingDay === selectedDay ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    {regeneratingDay === selectedDay ? 'Regenerating...' : 'Regenerate Day'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full"
                    onClick={handleEditPreferences}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Preferences
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Itinerary
                  </Button>
                </div>
              </>
            )}

            {/* Mobile Map View */}
            {activeTab === 'map' && (
              <div className="lg:hidden animate-fade-in">
                <GoogleMap
                  activities={currentDayData?.activities || []}
                  destination={destination}
                  budget={itinerary.tripSummary.budget}
                  transportMode={itinerary.tripSummary.transportMode || 'flight'}
                  dayNumber={selectedDay}
                />
              </div>
            )}

            {/* Mobile Budget View */}
            {activeTab === 'budget' && (
              <div className="lg:hidden animate-fade-in">
                <BudgetBreakdown />
              </div>
            )}
          </div>

            {/* Desktop Right Sidebar */}
          <div className="hidden lg:block lg:w-80 shrink-0 space-y-6">
            {/* Map Card */}
            <div className="space-y-4">
              <GoogleMap
                activities={currentDayData?.activities || []}
                destination={destination}
                budget={itinerary.tripSummary.budget}
                transportMode={itinerary.tripSummary.transportMode || 'flight'}
                dayNumber={selectedDay}
              />
            </div>

            {/* Budget Breakdown */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Budget Overview</h3>
              <Card className="p-4 rounded-2xl border-border/50">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Budget</span>
                    <span className="font-semibold">${itinerary.tripSummary.budget}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estimated Total</span>
                    <span className="font-semibold text-primary">${itinerary.budgetBreakdown?.estimatedTotal || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className={cn(
                      "text-sm font-medium capitalize",
                      itinerary.budgetBreakdown?.budgetStatus === 'within' ? 'text-green-600' :
                      itinerary.budgetBreakdown?.budgetStatus === 'under' ? 'text-blue-600' :
                      'text-orange-600'
                    )}>
                      {itinerary.budgetBreakdown?.budgetStatus || 'N/A'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <BottomNav />
    </div>
  );
};

export default Itinerary;

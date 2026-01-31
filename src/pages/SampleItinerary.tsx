import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, Calendar, Sparkles } from "lucide-react";

const SampleItinerary = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <span className="font-semibold text-foreground">Sample Trip</span>
          <div className="w-20" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Bali Explorer</h1>
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Bali, Indonesia
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              5 Days
            </span>
          </div>
        </div>

        <Card className="p-6 rounded-2xl border-border/50 mb-6">
          <p className="text-muted-foreground leading-relaxed">
            This sample itinerary was generated for a <strong>Chill + Foodie</strong> vibe 
            with interests in <strong>Culture, Nature, and Food</strong>. 
            It balances relaxation with authentic local experiences.
          </p>
        </Card>

        <div className="space-y-4 mb-8">
          {["Day 1: Arrival & Ubud Vibes", "Day 2: Temple & Waterfall Day", "Day 3: Beach Day in Seminyak", "Day 4: Cooking Class & Spa", "Day 5: Departure"].map((day, i) => (
            <Card key={i} className="p-4 rounded-xl border-border/50 hover:bg-muted/30 transition-colors cursor-pointer">
              <p className="font-medium text-foreground">{day}</p>
            </Card>
          ))}
        </div>

        <Button 
          onClick={() => navigate('/itinerary')} 
          className="w-full h-14 text-lg rounded-2xl"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          View Full Itinerary
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Want your own? <button onClick={() => navigate('/create')} className="text-primary hover:underline">Create a trip</button>
        </p>
      </div>
    </div>
  );
};

export default SampleItinerary;

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Home, Compass } from "lucide-react";

const Test = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          VibeVoyage is Working! 🎉
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Your Vercel deployment is successful. The app is loading correctly.
        </p>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/')} 
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Landing Page
          </Button>
          
          <Button 
            onClick={() => navigate('/create')} 
            variant="outline"
            className="w-full"
          >
            <Compass className="w-4 h-4 mr-2" />
            Create Trip
          </Button>
        </div>

        <div className="mt-6 text-xs text-muted-foreground">
          <div>Environment: {import.meta.env.MODE}</div>
          <div>API URL: {import.meta.env.VITE_API_URL || 'localhost:5000'}</div>
        </div>
      </Card>
    </div>
  );
};

export default Test;
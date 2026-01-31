import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import Landing from "./pages/Landing";
import CreateTrip from "./pages/CreateTrip";
import Loading from "./pages/Loading";
import Itinerary from "./pages/Itinerary";
import SampleItinerary from "./pages/SampleItinerary";
import NotFound from "./pages/NotFound";
import Test from "./pages/Test";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
      <p className="text-muted-foreground">Loading VibeVoyage...</p>
    </div>
  </div>
);

const App = () => {
  console.log('🚀 VibeVoyage App initializing...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/test" element={<Test />} />
              <Route path="/create" element={<CreateTrip />} />
              <Route path="/loading" element={<Loading />} />
              <Route path="/itinerary" element={<Itinerary />} />
              <Route path="/sample" element={<SampleItinerary />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

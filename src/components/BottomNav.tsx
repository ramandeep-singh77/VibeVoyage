import { useLocation, useNavigate } from "react-router-dom";
import { Home, Map, CalendarDays, Wallet, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: CalendarDays, label: "Itinerary", path: "/itinerary" },
  { icon: Map, label: "Map", path: "/itinerary?tab=map" },
  { icon: Wallet, label: "Budget", path: "/itinerary?tab=budget" },
  { icon: MessageCircle, label: "Assistant", path: "/assistant" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-card/80 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path.includes('?') && location.pathname + location.search === item.path);
            
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path.split('?')[0])}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;

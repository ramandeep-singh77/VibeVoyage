import { Card } from "@/components/ui/card";
import { Plane, Utensils, Home, Camera } from "lucide-react";

const budgetCategories = [
  { label: "Transport", icon: Plane, amount: 450, percentage: 35, color: "bg-ocean" },
  { label: "Food", icon: Utensils, amount: 280, percentage: 22, color: "bg-orange-400" },
  { label: "Stay", icon: Home, amount: 380, percentage: 30, color: "bg-primary" },
  { label: "Activities", icon: Camera, amount: 170, percentage: 13, color: "bg-teal" },
];

const BudgetBreakdown = () => {
  const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <Card className="rounded-2xl border-border/50 overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <h3 className="font-semibold text-foreground">Budget Estimate</h3>
      </div>
      <div className="p-4">
        {/* Total */}
        <div className="text-center mb-6">
          <p className="text-3xl font-bold text-foreground">${totalBudget}</p>
          <p className="text-sm text-muted-foreground">Total estimated cost</p>
        </div>

        {/* Progress Bar */}
        <div className="flex h-3 rounded-full overflow-hidden mb-6">
          {budgetCategories.map((cat, index) => (
            <div 
              key={cat.label}
              className={`${cat.color} transition-all`}
              style={{ width: `${cat.percentage}%` }}
            />
          ))}
        </div>

        {/* Categories */}
        <div className="space-y-3">
          {budgetCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${cat.color}/20 flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${cat.color.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="text-sm text-foreground">{cat.label}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium text-foreground">${cat.amount}</span>
                  <span className="text-muted-foreground text-sm ml-2">({cat.percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default BudgetBreakdown;

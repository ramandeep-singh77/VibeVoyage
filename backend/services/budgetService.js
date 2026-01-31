/**
 * Budget Calculation Service
 * Handles budget breakdown and optimization
 */

/**
 * Calculate comprehensive budget breakdown for an itinerary
 */
const calculateBudgetBreakdown = (dailyItinerary, totalBudget) => {
  console.log('💰 Calculating budget breakdown');

  const categoryTotals = {
    transport: 0,
    food: 0,
    activities: 0,
    accommodation: 0
  };

  let totalEstimated = 0;
  const dailyBreakdowns = [];

  // Calculate totals from all days
  dailyItinerary.forEach(day => {
    const dayBreakdown = {
      dayNumber: day.dayNumber,
      transport: 0,
      food: 0,
      activities: 0,
      accommodation: 0,
      total: 0
    };

    day.activities.forEach(activity => {
      const cost = activity.estimatedCost || 0;
      const category = activity.category;

      if (categoryTotals.hasOwnProperty(category)) {
        categoryTotals[category] += cost;
        dayBreakdown[category] += cost;
      }
      
      dayBreakdown.total += cost;
      totalEstimated += cost;
    });

    dailyBreakdowns.push(dayBreakdown);
  });

  // Add accommodation estimate (if not included in activities)
  const accommodationPerNight = estimateAccommodation(totalBudget, dailyItinerary.length);
  const totalAccommodation = accommodationPerNight * (dailyItinerary.length - 1); // Assume last day no accommodation
  
  categoryTotals.accommodation = totalAccommodation;
  totalEstimated += totalAccommodation;

  // Calculate daily average
  const dailyAverage = totalBudget / dailyItinerary.length;

  // Determine budget status
  let budgetStatus = 'within';
  const variance = (totalEstimated - totalBudget) / totalBudget;
  
  if (variance < -0.1) {
    budgetStatus = 'under';
  } else if (variance > 0.1) {
    budgetStatus = 'over';
  }

  // Calculate percentages
  const categoryPercentages = {};
  Object.keys(categoryTotals).forEach(category => {
    categoryPercentages[category] = totalEstimated > 0 
      ? Math.round((categoryTotals[category] / totalEstimated) * 100)
      : 0;
  });

  return {
    totalBudget,
    dailyAverage: Math.round(dailyAverage),
    categoryBreakdown: categoryTotals,
    categoryPercentages,
    estimatedTotal: Math.round(totalEstimated),
    budgetStatus,
    variance: Math.round(variance * 100),
    dailyBreakdowns,
    recommendations: generateBudgetRecommendations(budgetStatus, variance, categoryTotals, totalBudget)
  };
};

/**
 * Estimate accommodation costs based on budget and destination
 */
const estimateAccommodation = (totalBudget, totalDays) => {
  // Accommodation typically takes 30-40% of travel budget
  const accommodationBudget = totalBudget * 0.35;
  const perNight = accommodationBudget / (totalDays - 1);
  
  // Set reasonable bounds
  return Math.max(30, Math.min(perNight, totalBudget * 0.5));
};

/**
 * Generate budget recommendations based on analysis
 */
const generateBudgetRecommendations = (status, variance, categoryTotals, totalBudget) => {
  const recommendations = [];

  if (status === 'over') {
    recommendations.push({
      type: 'warning',
      message: `Budget exceeded by ${Math.abs(Math.round(variance))}%`,
      suggestions: [
        'Consider reducing expensive activities',
        'Look for free or low-cost alternatives',
        'Adjust accommodation to a lower tier'
      ]
    });

    // Specific category recommendations
    if (categoryTotals.food > totalBudget * 0.4) {
      recommendations.push({
        type: 'tip',
        message: 'Food costs are high',
        suggestions: ['Try local street food', 'Cook some meals if possible', 'Look for lunch specials']
      });
    }

    if (categoryTotals.activities > totalBudget * 0.4) {
      recommendations.push({
        type: 'tip',
        message: 'Activity costs are high',
        suggestions: ['Look for free walking tours', 'Visit free museums on certain days', 'Enjoy parks and outdoor activities']
      });
    }
  }

  if (status === 'under') {
    recommendations.push({
      type: 'success',
      message: `Budget is ${Math.abs(Math.round(variance))}% under - you have room for extras!`,
      suggestions: [
        'Consider upgrading accommodation',
        'Add a special dining experience',
        'Book additional activities or tours'
      ]
    });
  }

  if (status === 'within') {
    recommendations.push({
      type: 'success',
      message: 'Budget is well-balanced!',
      suggestions: [
        'Keep some emergency funds for unexpected expenses',
        'Consider travel insurance',
        'Save receipts for expense tracking'
      ]
    });
  }

  return recommendations;
};

/**
 * Optimize budget allocation across categories
 */
const optimizeBudgetAllocation = (totalBudget, travelVibe, interests) => {
  const baseAllocation = {
    transport: 0.20,
    food: 0.30,
    activities: 0.25,
    accommodation: 0.25
  };

  // Adjust based on travel vibe
  const vibeAdjustments = {
    'foodie': { food: 0.15, activities: -0.10 },
    'adventure': { activities: 0.15, accommodation: -0.10 },
    'chill': { accommodation: 0.10, activities: -0.05, food: -0.05 },
    'explorer': { activities: 0.10, transport: 0.05, accommodation: -0.15 }
  };

  const adjustments = vibeAdjustments[travelVibe] || {};
  
  // Apply adjustments
  Object.keys(adjustments).forEach(category => {
    baseAllocation[category] += adjustments[category];
  });

  // Convert to actual amounts
  const allocation = {};
  Object.keys(baseAllocation).forEach(category => {
    allocation[category] = Math.round(totalBudget * baseAllocation[category]);
  });

  return allocation;
};

/**
 * Calculate cost per person for group trips
 */
const calculateGroupCosts = (totalCost, groupSize, sharedExpenses = []) => {
  let sharedTotal = 0;
  let individualTotal = totalCost;

  // Calculate shared expenses
  sharedExpenses.forEach(expense => {
    sharedTotal += expense.amount;
    individualTotal -= expense.amount;
  });

  const sharedPerPerson = sharedTotal / groupSize;
  const costPerPerson = individualTotal + sharedPerPerson;

  return {
    totalCost,
    groupSize,
    costPerPerson: Math.round(costPerPerson),
    sharedExpenses: Math.round(sharedTotal),
    sharedPerPerson: Math.round(sharedPerPerson),
    individualExpenses: Math.round(individualTotal)
  };
};

/**
 * Generate budget alerts and warnings
 */
const generateBudgetAlerts = (currentSpending, totalBudget, daysRemaining, totalDays) => {
  const alerts = [];
  const daysElapsed = totalDays - daysRemaining;
  const expectedSpending = (totalBudget / totalDays) * daysElapsed;
  const spendingRate = currentSpending / expectedSpending;

  if (spendingRate > 1.2) {
    alerts.push({
      type: 'warning',
      level: 'high',
      message: 'Spending significantly above budget',
      recommendation: 'Consider reducing expenses for remaining days'
    });
  } else if (spendingRate > 1.1) {
    alerts.push({
      type: 'caution',
      level: 'medium',
      message: 'Spending slightly above budget',
      recommendation: 'Monitor expenses closely'
    });
  } else if (spendingRate < 0.8) {
    alerts.push({
      type: 'info',
      level: 'low',
      message: 'Spending below budget',
      recommendation: 'You have room for additional experiences'
    });
  }

  return alerts;
};

/**
 * Calculate savings opportunities
 */
const calculateSavingsOpportunities = (dailyItinerary) => {
  const opportunities = [];

  dailyItinerary.forEach(day => {
    // Check for expensive meals that could be replaced
    const expensiveMeals = day.activities.filter(
      activity => activity.category === 'food' && activity.estimatedCost > 50
    );

    if (expensiveMeals.length > 1) {
      const potentialSavings = expensiveMeals.reduce((sum, meal) => sum + (meal.estimatedCost * 0.3), 0);
      opportunities.push({
        day: day.dayNumber,
        type: 'food',
        description: 'Consider mixing fine dining with local eateries',
        potentialSavings: Math.round(potentialSavings)
      });
    }

    // Check for overlapping transport costs
    const transportActivities = day.activities.filter(
      activity => activity.category === 'transport'
    );

    if (transportActivities.length > 2) {
      opportunities.push({
        day: day.dayNumber,
        type: 'transport',
        description: 'Consider a day pass for public transport',
        potentialSavings: 10
      });
    }
  });

  return opportunities;
};

module.exports = {
  calculateBudgetBreakdown,
  optimizeBudgetAllocation,
  calculateGroupCosts,
  generateBudgetAlerts,
  calculateSavingsOpportunities,
  estimateAccommodation
};
export interface BusinessIdea {
  id: string;
  name: string;
  category: string;
  startupCost: string;
  monthlyProfit: string;
  riskLevel: "Low" | "Medium" | "High";
  score: number;
  whyItWorks: string;
  firstSteps: string[];
  isSample?: boolean;
}

export interface BusinessPlan {
  overview: string;
  targetCustomers: string;
  startupCostBreakdown: string[];
  equipment: string[];
  pricingStrategy: string;
  marketingStrategy: string;
  monthlyRevenue: string;
  monthlyExpenses: string;
  expectedProfit: string;
  risks: string[];
  first30Days: string[];
}

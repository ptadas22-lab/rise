export interface BusinessIdea {
  id: string;
  name: string;
  category: string;
  startupCost: string;
  expectedProfit: string;
  riskLevel: "Low" | "Medium" | "High";
  feasibilityScore: number;
  whyWorks: string;
  firstSteps: string[];
  isSample?: boolean;
}

export interface BusinessPlan {
  businessOverview: string;
  targetCustomers: string;
  startupCostBreakdown: string;
  requiredEquipment: string;
  pricingStrategy: string;
  marketingStrategy: string[];
  monthlyRevenueEstimate: string;
  monthlyExpenseEstimate: string;
  expectedProfit: string;
  riskFactors: string;
  first30DayActionPlan: string[];
}

import { useState, useEffect } from "react";
import { BusinessIdea, BusinessPlan } from "../types";
import { 
  X, Loader2, Users, Megaphone, 
  TrendingUp, Sparkles, AlertCircle, CheckCircle2,
  Briefcase, Coins, Hammer, Tag, TrendingDown, Award, AlertTriangle, Calendar,
  Bookmark, BookmarkCheck, Copy, Check, Download
} from "lucide-react";
import { jsPDF } from "jspdf";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://rise-6tca.onrender.com";

interface BusinessPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: BusinessIdea | null;
  budget: string;
  location: string;
  currency: string;
}

const PROGRESS_MESSAGES = [
  "Structuring strategic market projections...",
  "Calibrating target market demographics...",
  "Assembling operational supply-chain blueprints...",
  "Formulating daily ticket size and breakeven ratios...",
  "Finalizing visual expansion roadmaps..."
];

export default function BusinessPlanModal({
  isOpen,
  onClose,
  idea,
  budget,
  location,
  currency,
}: BusinessPlanModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const [isPlanSaved, setIsPlanSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Keep a progress ticker for heavy generation work
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setMsgIdx((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
      }, 3000);
    } else {
      setMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Check if current plan is saved
  useEffect(() => {
    if (idea && plan) {
      try {
        const stored = localStorage.getItem("saved_business_plans");
        if (stored) {
          const plans = JSON.parse(stored);
          if (plans[idea.id]) {
            setIsPlanSaved(true);
            return;
          }
        }
      } catch (e) {
        console.error("Error checking saved plan status:", e);
      }
    }
    setIsPlanSaved(false);
  }, [idea, plan]);

  useEffect(() => {
    if (isOpen && idea) {
      fetchBusinessPlan();
    } else {
      // Clear plan state on close
      setPlan(null);
      setError(null);
    }
  }, [isOpen, idea]);

  const fetchBusinessPlan = async () => {
    if (!idea) return;
    setLoading(true);
    setError(null);
    setPlan(null);

    // 1. Try to load from localStorage first!
    try {
      const stored = localStorage.getItem("saved_business_plans");
      if (stored) {
        const plans = JSON.parse(stored);
        if (plans[idea.id]) {
          setPlan(plans[idea.id]);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Error reading saved plan:", e);
    }

    // 2. Query Backend API
    try {
      const response = await fetch(`${backendUrl}/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idea,
          ideaName: idea.name,
          category: idea.category,
          budget: budget || idea.startupCost,
          location: location || "Global",
          currency: currency
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate plan");
      }

      const text = await response.text();

      const cleanText = text
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/\\/g, '\\\\')
        .trim();

      let cleaned = cleanText;
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/```$/i, '').trim();
      }

      let resData;
      try {
        resData = JSON.parse(cleaned);
      } catch (err) {
        let rawCleaned = text.trim();
        if (rawCleaned.startsWith('```')) {
          rawCleaned = rawCleaned.replace(/^```(?:json)?\n?/i, '').replace(/```$/i, '').trim();
        }
        resData = JSON.parse(rawCleaned);
      }

      if (resData.plan) {
        setPlan(resData.plan);
      } else {
        throw new Error("No plan was generated");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = () => {
    if (!idea || !plan) return;
    try {
      const stored = localStorage.getItem("saved_business_plans") || "{}";
      const plans = JSON.parse(stored);
      plans[idea.id] = plan;
      localStorage.setItem("saved_business_plans", JSON.stringify(plans));
      setIsPlanSaved(true);
    } catch (e) {
      console.error("Error saving plan:", e);
    }
  };

  const handleCopyPlan = () => {
    if (!plan || !idea) return;
    
    const textToCopy = `
BUSINESS EXECUTION PLAN FOR: ${idea.name}
Category: ${idea.category}
Budget Constraint: ${budget || idea.startupCost}
Target Location: ${location || "India"}

=========================================
1. BUSINESS OVERVIEW
${plan.overview}

2. TARGET CUSTOMERS
${plan.targetCustomers}

3. STARTUP COST BREAKDOWN
${Array.isArray(plan.startupCostBreakdown) ? plan.startupCostBreakdown.join("\n") : plan.startupCostBreakdown}

4. REQUIRED EQUIPMENT / RESOURCES
${Array.isArray(plan.equipment) ? plan.equipment.join("\n") : plan.equipment}

5. PRICING STRATEGY
${plan.pricingStrategy}

6. MARKETING STRATEGY
${Array.isArray(plan.marketingStrategy) ? plan.marketingStrategy.map((step, idx) => `${idx + 1}. ${step}`).join("\n") : plan.marketingStrategy}

7. MONTHLY REVENUE ESTIMATE
${plan.monthlyRevenue}

8. MONTHLY EXPENSE ESTIMATE
${plan.monthlyExpenses}

9. EXPECTED PROFIT
${plan.expectedProfit}

10. RISK FACTORS
${Array.isArray(plan.risks) ? plan.risks.join("\n") : plan.risks}

11. FIRST 30-DAY ACTION PLAN
${Array.isArray(plan.first30Days) ? plan.first30Days.map((step, idx) => `${idx + 1}. ${step}`).join("\n") : plan.first30Days}
    `.trim();

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

  const handleDownloadPDF = () => {
    if (!plan || !idea) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = 20;

    const checkPageBreak = (height: number) => {
      if (y + height > pageHeight - margin) {
        doc.addPage();
        y = margin;
        drawHeaderFooter();
      }
    };

    const drawHeaderFooter = () => {
      // Top border/accent bar
      doc.setFillColor(79, 70, 229); // Indigo #4F46E5
      doc.rect(0, 0, pageWidth, 4, "F");

      // Header text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175); // Slate 400
      doc.text("RISE - AI BUSINESS PLANNER", margin, 10);
      doc.text("CONFIDENTIAL", pageWidth - margin, 10, { align: "right" });
      
      // Bottom page numbering
      doc.setFont("helvetica", "normal");
      doc.text(`Page ${doc.internal.pages.length - 1}`, pageWidth - margin, pageHeight - 10, { align: "right" });
    };

    // Draw first page header
    drawHeaderFooter();
    y = 25;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(31, 41, 55); // Gray 800
    doc.text(idea.name.toUpperCase(), margin, y);
    y += 10;

    // Category and Location
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text(`Category: ${idea.category}  |  Location: ${location || "Global"}`, margin, y);
    y += 12;

    // Overview Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("1. Executive Summary", margin, y);
    y += 6;

    // Overview text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81); // Gray 700
    const overviewLines = doc.splitTextToSize(plan.overview, contentWidth);
    doc.text(overviewLines, margin, y);
    y += (overviewLines.length * 5) + 8;

    // Financial Summary Panel
    checkPageBreak(35);
    doc.setFillColor(243, 244, 246); // Gray 100
    doc.rect(margin, y, contentWidth, 24, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128); // Gray 500
    doc.text("STARTUP BUDGET", margin + 10, y + 8);
    doc.text("EST. REVENUE", margin + (contentWidth / 3) + 10, y + 8);
    doc.text("EST. NET PROFIT", margin + (2 * contentWidth / 3) + 10, y + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39); // Gray 900
    doc.text(budget || idea.startupCost, margin + 10, y + 16);
    doc.text(plan.monthlyRevenue, margin + (contentWidth / 3) + 10, y + 16);
    doc.text(plan.expectedProfit, margin + (2 * contentWidth / 3) + 10, y + 16);
    y += 32;

    // Target Customers
    checkPageBreak(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("2. Target Audience & Customers", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    const customerLines = doc.splitTextToSize(plan.targetCustomers, contentWidth);
    doc.text(customerLines, margin, y);
    y += (customerLines.length * 5) + 8;

    // Startup Cost Breakdown
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("3. Initial Capital Expenditure", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    
    const breakdownArray = Array.isArray(plan.startupCostBreakdown) 
      ? plan.startupCostBreakdown 
      : typeof plan.startupCostBreakdown === 'string'
        ? (plan.startupCostBreakdown as string).split("\n")
        : [];
        
    breakdownArray.forEach((item) => {
      checkPageBreak(6);
      doc.text(`• ${item}`, margin + 5, y);
      y += 5;
    });
    y += 4;

    // Required Equipment
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("4. Required Equipment & Resources", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    
    const equipmentArray = Array.isArray(plan.equipment)
      ? plan.equipment
      : typeof plan.equipment === 'string'
        ? (plan.equipment as string).split("\n")
        : [];
        
    equipmentArray.forEach((item) => {
      checkPageBreak(6);
      doc.text(`• ${item}`, margin + 5, y);
      y += 5;
    });
    y += 4;

    // Pricing & Marketing
    checkPageBreak(35);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("5. Operations & Marketing Strategy", margin, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text("Pricing Model:", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    const pricingLines = doc.splitTextToSize(plan.pricingStrategy, contentWidth);
    doc.text(pricingLines, margin, y);
    y += (pricingLines.length * 5) + 5;

    checkPageBreak(25);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text("Marketing Strategy:", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    
    const marketingText = Array.isArray(plan.marketingStrategy)
      ? plan.marketingStrategy.join("\n")
      : plan.marketingStrategy;
      
    const marketingLines = doc.splitTextToSize(marketingText, contentWidth);
    doc.text(marketingLines, margin, y);
    y += (marketingLines.length * 5) + 8;

    // Financial Estimates Details
    checkPageBreak(35);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("6. Monthly Financial Estimates", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text(`Monthly Projected Revenue: ${plan.monthlyRevenue}`, margin + 5, y);
    y += 6;
    
    const expensesText = Array.isArray(plan.monthlyExpenses)
      ? plan.monthlyExpenses.join(", ")
      : plan.monthlyExpenses;
    doc.text(`Monthly Operating Expenses: ${expensesText}`, margin + 5, y);
    y += 6;
    doc.text(`Net Monthly Profit: ${plan.expectedProfit}`, margin + 5, y);
    y += 10;

    // Risks & Mitigations
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("7. Risk Assessment & Mitigations", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    
    const risksArray = Array.isArray(plan.risks)
      ? plan.risks
      : typeof plan.risks === 'string'
        ? (plan.risks as string).split("\n")
        : [];
        
    risksArray.forEach((risk) => {
      checkPageBreak(8);
      const riskLines = doc.splitTextToSize(`• ${risk}`, contentWidth - 5);
      doc.text(riskLines, margin + 5, y);
      y += (riskLines.length * 5);
    });
    y += 4;

    // First 30 Days
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("8. First 30 Days Action Plan", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    
    const stepsArray = Array.isArray(plan.first30Days)
      ? plan.first30Days
      : typeof plan.first30Days === 'string'
        ? (plan.first30Days as string).split("\n")
        : [];
        
    stepsArray.forEach((step, idx) => {
      checkPageBreak(8);
      const stepLines = doc.splitTextToSize(`${idx + 1}. ${step}`, contentWidth - 5);
      doc.text(stepLines, margin + 5, y);
      y += (stepLines.length * 5) + 1;
    });

    doc.save(`${idea.name.toLowerCase().replace(/\s+/g, "_")}_business_plan.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="relative w-full sm:max-w-4xl h-full sm:h-auto max-h-screen sm:max-h-[90vh] flex flex-col rounded-none sm:rounded-3xl bg-[#050510] border-0 sm:border border-white/10 text-gray-100 shadow-2xl overflow-hidden focus:outline-none">
        
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-white/5 backdrop-blur-md gap-4">
          <div className="min-w-0">
            <span className="inline-block text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-blue-400 bg-blue-500/15 px-2.5 py-1 rounded border border-blue-500/20">
              Execution Roadmap
            </span>
            <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight text-white mt-2 truncate">
              {idea ? idea.name : "Business Plan"}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 font-mono leading-tight">
              Calibrated for budget &apos;{budget || idea?.startupCost}&apos; • location &apos;{location || "Global"}&apos;
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!loading && !error && plan && (
              <button
                onClick={handleDownloadPDF}
                title="Download PDF Plan"
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[36px] sm:min-h-[40px]"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                <span className="hidden sm:inline">Download PDF</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <div className="text-center">
                <p className="text-white font-extrabold uppercase text-sm tracking-wider">Creating your business plan...</p>
                <p className="text-xs font-mono text-blue-400 italic animate-pulse mt-1.5 px-6">
                  &ldquo;{PROGRESS_MESSAGES[msgIdx]}&rdquo;
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 max-w-xl mx-auto text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-extrabold text-white text-base uppercase">Generation Halted</h4>
                <p className="text-xs text-slate-400">{error}</p>
              </div>
              <button 
                onClick={fetchBusinessPlan}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors border border-transparent shadow cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          )}

          {!loading && !error && plan && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 font-sans">
              
              {/* Section 1: Business Overview */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3 text-blue-400">
                  <span className="p-1.5 rounded-lg bg-blue-400/10 border border-white/5">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-white uppercase tracking-tight text-sm">Business Overview</h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-medium whitespace-pre-line">
                  {plan.overview}
                </p>
              </div>

              {/* Section 2: Target Customers */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3 text-indigo-400">
                  <span className="p-1.5 rounded-lg bg-indigo-400/10 border border-white/5">
                    <Users className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-white uppercase tracking-tight text-sm">Target Customers</h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-medium whitespace-pre-line">
                  {plan.targetCustomers}
                </p>
              </div>

              {/* Section 3: Startup Cost Breakdown */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3 text-amber-500">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 border border-white/5">
                    <Coins className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-white uppercase tracking-tight text-sm">Startup Cost Breakdown</h4>
                </div>
                <div className="text-xs text-gray-300 leading-relaxed font-medium">
                  {Array.isArray(plan.startupCostBreakdown) ? (
                    <ul className="list-disc pl-4 space-y-1.5">
                      {plan.startupCostBreakdown.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="whitespace-pre-line">{plan.startupCostBreakdown}</p>
                  )}
                </div>
              </div>

              {/* Section 4: Required Equipment */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3 text-rose-400">
                  <span className="p-1.5 rounded-lg bg-rose-500/10 border border-white/5">
                    <Hammer className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-white uppercase tracking-tight text-sm">Required Equipment &amp; Resources</h4>
                </div>
                <div className="text-xs text-gray-300 leading-relaxed font-medium">
                  {Array.isArray(plan.equipment) ? (
                    <ul className="list-disc pl-4 space-y-1.5">
                      {plan.equipment.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="whitespace-pre-line">{plan.equipment}</p>
                  )}
                </div>
              </div>

              {/* Section 5: Pricing Strategy */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3 text-cyan-400">
                  <span className="p-1.5 rounded-lg bg-cyan-500/10 border border-white/5">
                    <Tag className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-white uppercase tracking-tight text-sm">Pricing Strategy</h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-medium whitespace-pre-line">
                  {plan.pricingStrategy}
                </p>
              </div>

              {/* Section 6: Marketing Strategy */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3 text-green-400">
                  <span className="p-1.5 rounded-lg bg-green-500/10 border border-white/5">
                    <Megaphone className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-white uppercase tracking-tight text-sm">Marketing Strategy</h4>
                </div>
                <div className="text-xs text-gray-300 font-medium">
                  {Array.isArray(plan.marketingStrategy) ? (
                    <ul className="space-y-2.5">
                      {plan.marketingStrategy.map((step, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="whitespace-pre-line">{plan.marketingStrategy}</p>
                  )}
                </div>
              </div>

              {/* Section 7: Monthly Revenue Estimate */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3 text-teal-400">
                  <span className="p-1.5 rounded-lg bg-teal-500/10 border border-white/5">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-white uppercase tracking-tight text-sm">Monthly Revenue</h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-medium whitespace-pre-line">
                  {plan.monthlyRevenue}
                </p>
              </div>

              {/* Section 8: Monthly Expense Estimate */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3 text-orange-400">
                  <span className="p-1.5 rounded-lg bg-orange-500/10 border border-white/5">
                    <TrendingDown className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-white uppercase tracking-tight text-sm">Monthly Expenses</h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-medium whitespace-pre-line">
                  {plan.monthlyExpenses}
                </p>
              </div>

              {/* Section 9: Expected Profit */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-white/5">
                    <Award className="w-4 h-4 text-emerald-400" />
                  </span>
                  <h4 className="text-white uppercase tracking-tight text-sm">Expected Profit</h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-semibold whitespace-pre-line">
                  {plan.expectedProfit}
                </p>
              </div>

              {/* Section 10: Risk Factors */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3 text-amber-500">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 border border-white/5">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-white uppercase tracking-tight text-sm">Risk Factors</h4>
                </div>
                <div className="text-xs text-gray-300 leading-relaxed font-medium">
                  {Array.isArray(plan.risks) ? (
                    <ul className="list-disc pl-4 space-y-1.5">
                      {plan.risks.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="whitespace-pre-line">{plan.risks}</p>
                  )}
                </div>
              </div>

              {/* Section 11: First 30-Day Action Plan */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300 col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-3 text-purple-400">
                  <span className="p-1.5 rounded-lg bg-purple-500/10 border border-white/5">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-white uppercase tracking-tight text-sm">First 30-Day Action Plan</h4>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {Array.isArray(plan.first30Days) ? (
                    plan.first30Days.map((step, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-gray-300 font-medium p-3 rounded-xl bg-white/2">
                        <span className="w-5 h-5 rounded bg-purple-500/15 border border-white/5 text-purple-400 flex items-center justify-center font-mono text-[9px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex gap-2.5 items-start text-xs text-gray-300 font-medium p-3 rounded-xl bg-white/2">
                      <span>{plan.first30Days}</span>
                    </li>
                  )}
                </ul>
              </div>

            </div>
          )}

        </div>

        {/* Action Bottom Rail */}
        <div className="p-4 sm:p-5 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Plan dynamically calibrated for microenterprise growth
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            {!loading && !error && plan && (
              <>
                <button
                  onClick={handleSavePlan}
                  className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border cursor-pointer min-h-[40px] ${
                    isPlanSaved
                      ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400"
                      : "bg-[#050510] hover:bg-white/5 text-slate-300 border-white/10"
                  }`}
                >
                  {isPlanSaved ? (
                     <>
                       <BookmarkCheck className="w-4 h-4 text-indigo-400" />
                       <span>Saved to Device</span>
                     </>
                  ) : (
                     <>
                       <Bookmark className="w-4 h-4 text-slate-400" />
                       <span>Save Plan</span>
                     </>
                  )}
                </button>
                <button
                  onClick={handleCopyPlan}
                  className="px-4 py-2 bg-[#050510] hover:bg-white/5 text-slate-300 border border-white/10 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[40px]"
                >
                  {copied ? (
                     <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span>Copied!</span>
                     </>
                  ) : (
                     <>
                        <Copy className="w-4 h-4 text-slate-400" />
                        <span>Copy Plan</span>
                     </>
                  )}
                </button>
              </>
            )}
            <button 
              onClick={onClose}
              className="px-5 py-2 bg-white text-black hover:bg-neutral-100 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md focus:outline-none cursor-pointer min-h-[40px] flex items-center justify-center"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

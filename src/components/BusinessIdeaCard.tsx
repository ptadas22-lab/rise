import { useState } from "react";
import { BusinessIdea } from "../types";
import { 
  DollarSign, TrendingUp, ShieldAlert, CheckCircle2, Bookmark, BookmarkCheck, 
  Copy, Check, FileText, Compass, MapPin, Layers
} from "lucide-react";

interface BusinessIdeaCardProps {
  idea: BusinessIdea;
  isSaved: boolean;
  onToggleSave: () => void;
  onGeneratePlan: () => void;
  key?: any;
}

export default function BusinessIdeaCard({
  idea,
  isSaved,
  onToggleSave,
  onGeneratePlan,
}: BusinessIdeaCardProps) {
  const [copied, setCopied] = useState(false);

  const getRiskBadgeColor = (level: "Low" | "Medium" | "High") => {
    switch (level) {
      case "Low":
        return "bg-green-500/20 text-green-400";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "High":
        return "bg-rose-500/20 text-rose-400";
      default:
        return "bg-white/10 text-gray-400";
    }
  };

  const handleCopy = () => {
    const textToCopy = `
Business Idea: ${idea.name}
Category: ${idea.category}
Estimated Startup Cost: ${idea.startupCost}
Expected Monthly Profit: ${idea.monthlyProfit}
Risk Level: ${idea.riskLevel}
Feasibility Score: ${idea.score}/100

Why it works:
${idea.whyItWorks}

Execution Action Steps:
${idea.firstSteps.map((step, idx) => `${idx + 1}. ${step}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-3xl bg-white/5 p-4 sm:p-5 md:p-6 border border-white/10 flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300 shadow-xl">
      
      {idea.isSample && (
        <span className="absolute top-3 right-4 text-[9px] uppercase tracking-widest font-bold bg-blue-500/20 text-blue-400 py-0.5 px-2 rounded-full">
          Featured Demo
        </span>
      )}

      <div>
        {/* Risk & Feasibility Headline */}
        <div className="flex justify-between items-start mb-2">
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider ${getRiskBadgeColor(idea.riskLevel)}`}>
            {idea.riskLevel} Risk
          </span>
          <div className="text-right">
            <span className="text-2xl font-black tracking-tight text-white">{idea.score}</span>
            <span className="text-xs text-gray-500 font-bold">/100</span>
          </div>
        </div>

        {/* Category */}
        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">
          {idea.category}
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-white mt-1.5 leading-snug tracking-tight">
          {idea.name}
        </h3>

        {/* Short description / validation */}
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          {idea.whyItWorks}
        </p>

        {/* Cost & Profit Grid inside card */}
        <div className="grid grid-cols-2 gap-3 text-[11px] my-5">
          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
            <div className="text-gray-500 uppercase font-bold text-[9px] tracking-widest">Startup Cost</div>
            <div className="text-sm font-bold text-blue-400 font-mono mt-0.5">{idea.startupCost}</div>
          </div>
          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
            <div className="text-gray-500 uppercase font-bold text-[9px] tracking-widest">Net Profit Est.</div>
            <div className="text-sm font-bold text-green-400 font-mono mt-0.5">{idea.monthlyProfit}</div>
          </div>
        </div>

        {/* First Steps Actions lists */}
        <div className="mb-6">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2.5">
            First Launch Steps
          </div>
          <ul className="text-[11px] space-y-1.5 opacity-85 list-disc pl-4 text-slate-300">
            {idea.firstSteps.slice(0, 3).map((step, index) => (
              <li key={index} className="leading-snug">
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action triggers and utility operations buttons row */}
      <div className="flex flex-col gap-2 pt-4 border-t border-white/10 mt-auto">
        <div className="flex gap-2">
          {/* Main Plan Access trigger */}
          <button
            onClick={onGeneratePlan}
            className="flex-1 py-2.5 rounded-lg bg-white text-black hover:bg-neutral-100 font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer min-h-[40px] md:min-h-[44px] flex items-center justify-center px-2"
          >
            Generate Full Plan
          </button>

          {/* Save/un-save element toggle */}
          <button
            onClick={onToggleSave}
            title={isSaved ? "Saved Concept" : "Save Concept"}
            className={`w-10 rounded-lg border flex items-center justify-center transition-colors cursor-pointer min-h-[40px] md:min-h-[44px] ${
              isSaved
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                : "bg-black/20 border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
          </button>

          {/* Clip description copy */}
          <button
            onClick={handleCopy}
            title="Copy concept"
            className={`w-10 rounded-lg border flex items-center justify-center transition-colors cursor-pointer min-h-[40px] md:min-h-[44px] ${
              copied
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-black/20 border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

    </div>
  );
}

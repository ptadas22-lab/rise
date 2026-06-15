import { Sparkles, TrendingUp } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative text-center py-12 md:py-20 max-w-5xl mx-auto px-4 overflow-hidden">
      {/* Decorative gradient background blur */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 left-1/3 -translate-x-1/2 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6 font-mono tracking-wider animate-pulse">
        <Sparkles className="w-3.5 h-3.5" />
        POWERED BY GEMINI 3.5 FLASH
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] sm:leading-[0.95] tracking-tight text-white uppercase mb-4">
        Turn Your{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
          Ideas Into
        </span>{" "}
        Businesses
      </h1>

      {/* Brand Statement */}
      <div className="text-blue-400 text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-widest mb-6 select-none bg-blue-500/10 inline-block px-3.5 py-1.5 rounded-md border border-blue-500/15">
        AI Business Ideas for Small Businesses Worldwide.
      </div>

      {/* Subtitle */}
      <p className="text-sm md:text-base text-slate-400 max-w-3xl mx-auto leading-relaxed font-semibold">
        Discover realistic business opportunities based on your budget, location, and interests. Get startup costs, profit potential, risk analysis, and actionable first steps.
      </p>

      {/* Mini Stats Banner */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-slate-900/40 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Real cost estimations
        </div>
        <div className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-slate-900/40 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          Location-centric demand analysis
        </div>
        <div className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-slate-900/40 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          Step-by-step launch checklists
        </div>
      </div>
    </div>
  );
}

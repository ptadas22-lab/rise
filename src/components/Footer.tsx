import { Sparkles, TrendingUp } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 py-10 px-4 mt-16 text-center text-slate-500 text-xs bg-black/10">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-between gap-6 md:flex-row">
        {/* Brand identity */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-md flex items-center justify-center font-bold text-white text-[10px]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-black tracking-widest uppercase text-white">
              RISE
            </span>
          </div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none mt-0.5">
            From Idea to Income.
          </span>
        </div>

        {/* Mandated core credits */}
        <p className="max-w-md text-center md:text-left text-slate-450 text-slate-400 text-[11px] leading-relaxed font-semibold">
          Helping future entrepreneurs discover their next opportunity. Built for students, side hustlers, small shop owners, and first-time entrepreneurs.
        </p>

        {/* Technical context */}
        <div className="flex items-center gap-4 text-slate-500 font-mono text-[10px]">
          <span>&copy; {currentYear} RISE</span>
          <span className="text-slate-800">|</span>
          <span className="flex items-center gap-1 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded border border-white/10">
            <Sparkles className="w-3" />
            #MAKEININDIA
          </span>
        </div>
      </div>
    </footer>
  );
}

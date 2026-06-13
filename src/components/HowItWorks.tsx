import { DollarSign, MapPin, Zap, Bookmark } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: DollarSign,
      title: "Set Budget",
      desc: "Specify your starting capital. AI calculates realistic, handpicked options tailored to your exact limits.",
      color: "from-blue-500 to-indigo-500",
      accent: "text-blue-400"
    },
    {
      step: "02",
      icon: MapPin,
      title: "Select City",
      desc: "Specify your target city. AI gathers hyper-local market constraints, demand parameters, and legal requirements.",
      color: "from-indigo-500 to-violet-500",
      accent: "text-indigo-400"
    },
    {
      step: "03",
      icon: Zap,
      title: "AI Analysis",
      desc: "Instantly fetch calculated profiles, including feasibility scores, cost breakdowns, and first 3 launch steps.",
      color: "from-violet-500 to-fuchsia-500",
      accent: "text-violet-400"
    },
    {
      step: "04",
      icon: Bookmark,
      title: "Launch Plan",
      desc: "Save your favorite concepts with standard local persistence or generate highly detailed, step-by-step rollout plans.",
      color: "from-fuchsia-500 to-pink-500",
      accent: "text-fuchsia-400"
    }
  ];

  return (
    <div className="py-12 md:py-16 px-4 max-w-6xl mx-auto border-t border-white/10">
      <div className="text-center mb-10">
        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Workflow Strategy</div>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">How It Works</h2>
        <p className="text-slate-400 max-w-lg mx-auto text-xs leading-relaxed font-semibold">
          Get from point absolute zero to a ready business plan in under sixty seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="group relative p-6 rounded-3xl bg-white/5 border border-white/10 transition-all duration-300 hover:border-blue-500/50"
            >
              {/* Header inside card */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-black/40 border border-white/10 ${s.accent} transition-transform duration-300 group-hover:scale-105`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-3xl font-black font-mono text-gray-700 tracking-tighter">
                  {s.step}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-bold text-white mb-2 leading-tight uppercase transition-colors">
                {s.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

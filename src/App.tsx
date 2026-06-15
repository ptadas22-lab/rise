import { useState, useEffect, FormEvent } from "react";
import { BusinessIdea } from "./types";
import { SAMPLE_IDEAS } from "./data/samples";
import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";
import BusinessIdeaCard from "./components/BusinessIdeaCard";
import BusinessPlanModal from "./components/BusinessPlanModal";
import { 
  DollarSign, MapPin, Search, Compass, Sparkles, 
  Layers, Bookmark, List, RefreshCw, AlertCircle, Trash2, TrendingUp
} from "lucide-react";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://rise-6tca.onrender.com";

const getCurrencySymbol = (currStr: string) => {
  const match = currStr.match(/\(([^)]+)\)/);
  return match ? match[1] : "$";
};

export default function App() {
  // Input states
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [interest, setInterest] = useState("");
  const [ideaCount, setIdeaCount] = useState("5");
  const [currency, setCurrency] = useState("USD ($)");

  // App tabs & filters
  const [activeTab, setActiveTab] = useState<"generated" | "saved">("generated");
  const [savedSearchQuery, setSavedSearchQuery] = useState("");

  // Storage states
  const [generatedIdeas, setGeneratedIdeas] = useState<BusinessIdea[]>(SAMPLE_IDEAS);
  const [savedIdeas, setSavedIdeas] = useState<BusinessIdea[]>([]);
  const [hasGeneratedResult, setHasGeneratedResult] = useState(false);

  // Connection & status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Plan formulation modal state
  const [activePlanIdea, setActivePlanIdea] = useState<BusinessIdea | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Hydrate saved ideas on initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem("saved_business_ideas");
      if (stored) {
        setSavedIdeas(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Could not retrieve saved ideas:", e);
    }
  }, []);

  // Sync saved ideas changes to localStorage
  const saveToLocalStorage = (updated: BusinessIdea[]) => {
    setSavedIdeas(updated);
    try {
      localStorage.setItem("saved_business_ideas", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to commit saved ideas:", e);
    }
  };

  // Toggle bookmark / save status
  const handleToggleSave = (idea: BusinessIdea) => {
    const isAlreadySaved = savedIdeas.some((s) => s.id === idea.id);
    if (isAlreadySaved) {
      const filtered = savedIdeas.filter((s) => s.id !== idea.id);
      saveToLocalStorage(filtered);
    } else {
      const updated = [...savedIdeas, { ...idea, isSample: false }];
      saveToLocalStorage(updated);
    }
  };

  // Clear all saved search preferences
  const handleClearSaved = () => {
    if (window.confirm("Are you sure you want to clear all saved business ideas?")) {
      saveToLocalStorage([]);
    }
  };

  // Submit form and request AI generated ideas
  const handleGenerateIdeas = async (e: FormEvent) => {
    e.preventDefault();
    if (!budget.trim() || !location.trim()) {
      setError("Please specify both a starting budget and a location.");
      return;
    }

    setLoading(true);
    setError(null);

    const count = parseInt(ideaCount) || 5;

    try {
      const response = await fetch(`${backendUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          budget,
          location,
          interest,
          count,
          currency
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate ideas");
      }

      const text = await response.text(); // NOT response.json()

      const cleanText = text
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/\\/g, '\\\\')
        .trim();

      let cleaned = cleanText;
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/```$/i, '').trim();
      }

      let data;
      try {
        data = JSON.parse(cleaned);
      } catch (err) {
        let rawCleaned = text.trim();
        if (rawCleaned.startsWith('```')) {
          rawCleaned = rawCleaned.replace(/^```(?:json)?\n?/i, '').replace(/```$/i, '').trim();
        }
        data = JSON.parse(rawCleaned);
      }

      if (data.ideas && Array.isArray(data.ideas)) {
        // Hydrate ideas with distinct ids so copy / save work reliably
        const formattedIdeas: BusinessIdea[] = data.ideas.map((idea: any, idx: number) => ({
          ...idea,
          id: `gen_${Date.now()}_${idx}`,
          isSample: false
        }));

        setGeneratedIdeas(formattedIdeas);
        setHasGeneratedResult(true);
        setActiveTab("generated");
      } else {
        throw new Error("No business ideas were found for these parameters. Try a different query.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected issue occurred while requesting suggestions.");
    } finally {
      setLoading(false);
    }
  };

  // Filter saved ideas based on search
  const filteredSavedIdeas = savedIdeas.filter((idea) => {
    const query = savedSearchQuery.toLowerCase();
    return (
      idea.name.toLowerCase().includes(query) ||
      idea.category.toLowerCase().includes(query) ||
      idea.startupCost.toLowerCase().includes(query) ||
      idea.whyItWorks.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#050510] text-gray-100 flex flex-col justify-between selection:bg-blue-500/30 selection:text-white">
      {/* Dynamic colorful blobs */}
      <div className="fixed top-0 left-0 right-0 h-[500px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-250px] left-[-150px] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[-150px] right-[-150px] w-[550px] h-[550px] bg-purple-600/10 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header Branding */}
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-40 transition-shadow">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white shrink-0">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-base sm:text-xl font-black tracking-widest uppercase text-white flex items-center gap-1 min-w-0">
                <span>RISE</span>
                <span className="text-blue-400 font-extrabold text-[8px] md:text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/15 lowercase tracking-normal shrink-0">beta</span>
              </span>
            </div>
            
            {/* Minimal top indicators */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button className="hidden sm:inline-block px-4 py-1.5 rounded-full border border-white/20 text-[10px] uppercase tracking-wider font-bold text-slate-300 hover:bg-white/5 transition-colors cursor-pointer">
                Student Plan
              </button>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 border border-white/30 shrink-0" />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <HeroSection />

        {/* Main Workspace Area */}
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex-grow w-full pb-8 space-y-8 md:space-y-12">
          
          {/* Main Panel grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Input Form Card (Span 4) */}
            <div id="form-panel" className="lg:col-span-4">
              <div className="relative rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6 md:p-8 shadow-2xl">
                {/* Decorative left/top bar inside premium card */}
                <div className="absolute top-4 left-0 bottom-4 w-[2px] bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-r" />

                <div className="mb-6 pl-2">
                  <h2 className="text-xl font-black uppercase tracking-tight text-white leading-tight">Configure Search Profile</h2>
                  <p className="text-[11px] text-slate-400 mt-1">AI builds optimized models based on your specified constraints.</p>
                </div>

                <form onSubmit={handleGenerateIdeas} className="space-y-5">
                  {/* Currency Dropdown */}
                  <div className="space-y-1.5">
                    <label htmlFor="currency-input" className="block text-[10px] font-extrabold uppercase tracking-widest text-blue-400 font-mono">
                      Currency
                    </label>
                    <div className="relative">
                      <select
                        id="currency-input"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-white transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="USD ($)" className="bg-[#050510]">USD ($)</option>
                        <option value="EUR (€)" className="bg-[#050510]">EUR (€)</option>
                        <option value="GBP (£)" className="bg-[#050510]">GBP (£)</option>
                        <option value="INR (₹)" className="bg-[#050510]">INR (₹)</option>
                        <option value="CAD (C$)" className="bg-[#050510]">CAD (C$)</option>
                        <option value="AUD (A$)" className="bg-[#050510]">AUD (A$)</option>
                        <option value="SGD (S$)" className="bg-[#050510]">SGD (S$)</option>
                        <option value="AED (د.إ)" className="bg-[#050510]">AED (د.إ)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                        <span className="text-xs">▼</span>
                      </div>
                    </div>
                  </div>

                  {/* Budget input */}
                  <div className="space-y-1.5">
                    <label htmlFor="budget-input" className="block text-[10px] font-extrabold uppercase tracking-widest text-blue-400 font-mono">
                      Budget ({getCurrencySymbol(currency)})
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
                        <span className="font-bold text-sm">{getCurrencySymbol(currency)}</span>
                      </div>
                      <input
                        id="budget-input"
                        type="text"
                        required
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g. 10,000 or 100k"
                        className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm placeholder:text-gray-600 text-white transition-all outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">
                      Include initial inventory, startup equipment and rent buffer.
                    </p>
                  </div>

                  {/* Location input */}
                  <div className="space-y-1.5">
                    <label htmlFor="location-input" className="block text-[10px] font-extrabold uppercase tracking-widest text-blue-400 font-mono">
                      Target City / Location
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        id="location-input"
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. London, New York, Tokyo"
                        className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm placeholder:text-gray-600 text-white transition-all outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">
                      Inputs target location demand profile for localized demographics.
                    </p>
                  </div>

                  {/* Business Type input */}
                  <div className="space-y-1.5">
                    <label htmlFor="interest-input" className="block text-[10px] font-extrabold uppercase tracking-widest text-blue-400 font-mono">
                      Interest / Industry / Niche
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
                        <Layers className="w-4 h-4" />
                      </div>
                      <input
                        id="interest-input"
                        type="text"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        placeholder="e.g. Coffee shop, E-commerce, Cleaning service"
                        className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm placeholder:text-gray-600 text-white transition-all outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">
                      Match recommendations to specific market industries.
                    </p>
                  </div>

                  {/* Idea count dropdown */}
                  <div className="space-y-1.5">
                    <label htmlFor="count-input" className="block text-[10px] font-extrabold uppercase tracking-widest text-blue-400 font-mono">
                      Idea Volume (Generation Density)
                    </label>
                    <div className="relative">
                      <select
                        id="count-input"
                        value={ideaCount}
                        onChange={(e) => setIdeaCount(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-white transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="3" className="bg-[#050510]">3 Optimized Startup Paths</option>
                        <option value="5" className="bg-[#050510]">5 Optimized Startup Paths</option>
                        <option value="10" className="bg-[#050510]">10 Optimized Startup Paths</option>
                      </select>
                      {/* Custom indicator arrow for select */}
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                        <span className="text-xs">▼</span>
                      </div>
                    </div>
                  </div>

                  {/* Error Notification inside input column */}
                  {error && (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mt-4">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Generate Smart Ideas button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:from-slate-800 disabled:to-slate-900 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Generating ideas...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>GENERATE SMART IDEAS</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6">
                  <div className="flex gap-3 items-start p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-[11px] text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0 mt-1"></div>
                    <div>
                      <span className="font-bold uppercase tracking-wider text-blue-400 mr-1 text-[10px]">Live Insight:</span>
                      Mobile coffee carts and micro-SaaS services show a 25% higher first-year survival rate globally.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Tab Display / Idea List (Span 7) */}
            <div id="results-panel" className="lg:col-span-8 space-y-6">
                     {/* Dashboard Nav Tabs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/10 pb-2">
                <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab("generated")}
                    className={`flex-1 sm:flex-none pb-2 text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 px-1 sm:px-4 text-center whitespace-nowrap min-h-[40px] flex items-center justify-center ${
                      activeTab === "generated"
                        ? "border-blue-500 text-white"
                        : "border-transparent text-gray-500 hover:text-white"
                    }`}
                  >
                    GENERATED IDEAS ({generatedIdeas.length})
                  </button>

                  <button
                    onClick={() => setActiveTab("saved")}
                    className={`flex-1 sm:flex-none pb-2 text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 px-1 sm:px-4 text-center whitespace-nowrap min-h-[40px] flex items-center justify-center ${
                      activeTab === "saved"
                        ? "border-blue-500 text-white"
                        : "border-transparent text-gray-500 hover:text-white"
                    }`}
                  >
                    SAVED ({savedIdeas.length})
                  </button>
                </div>

                {/* Saved Tab filter controls / Search Saved Ideas */}
                {activeTab === "saved" && savedIdeas.length > 0 && (
                  <div className="flex items-center gap-2 w-full sm:max-w-xs sm:ml-auto">
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Search className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={savedSearchQuery}
                        onChange={(e) => setSavedSearchQuery(e.target.value)}
                        placeholder="Search saved..."
                        className="w-full pl-8.5 pr-3 py-2 bg-[#050510] border border-white/10 rounded-full text-xs focus:outline-none focus:border-blue-500 font-sans text-white placeholder:text-gray-600"
                      />
                    </div>
                    <button
                      onClick={handleClearSaved}
                      title="Clear All Bookmarks"
                      className="p-2.5 bg-[#050510] hover:bg-red-500/10 hover:text-red-400 border border-white/10 rounded-full text-gray-400 transition-colors shrink-0 cursor-pointer min-h-[40px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Render List contents */}
              {activeTab === "generated" ? (
                <div className="space-y-6">
                  {/* Context heading for recommendation pool */}
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <h3 className="text-sm font-semibold text-slate-350 uppercase tracking-widest font-mono">
                      {hasGeneratedResult ? "AI Recommended Startup Concepts" : "Recommended Starter Concepts (Samples)"}
                    </h3>
                    <span className="text-slate-500 text-xs font-mono">
                      Showing {generatedIdeas.length} concepts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {generatedIdeas.map((idea, idx) => (
                      <BusinessIdeaCard
                        key={idea.id || idx}
                        idea={idea}
                        isSaved={savedIdeas.some((s) => s.id === idea.id)}
                        onToggleSave={() => handleToggleSave(idea)}
                        onGeneratePlan={() => {
                          setActivePlanIdea(idea);
                          setIsPlanModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <h3 className="text-sm font-semibold text-slate-350 uppercase tracking-widest font-mono">
                      Your Bookmarked Opportunities
                    </h3>
                    <span className="text-slate-500 text-xs font-mono">
                      Filtered: {filteredSavedIdeas.length} / {savedIdeas.length} Total
                    </span>
                  </div>

                  {savedIdeas.length === 0 ? (
                    <div className="text-center p-12 rounded-2xl border border-dashed border-slate-800 bg-slate-900/10">
                      <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                      <p className="text-white font-medium">No Bookmarked Ideas Yet</p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                        Whenever you browse the recommended tab, click the &quot;Save Idea&quot; button to keep track of interesting opportunities here.
                      </p>
                    </div>
                  ) : filteredSavedIdeas.length === 0 ? (
                    <div className="text-center p-12 rounded-2xl border border-dashed border-slate-800 bg-slate-900/10">
                      <Search className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                      <p className="text-white font-medium">No Match Found</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        We couldn&apos;t find any saved ideas matching your search query &apos;{savedSearchQuery}&apos;. Try searching by name or category.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                      {filteredSavedIdeas.map((idea, idx) => (
                        <BusinessIdeaCard
                          key={idea.id || idx}
                          idea={idea}
                          isSaved={true}
                          onToggleSave={() => handleToggleSave(idea)}
                          onGeneratePlan={() => {
                            setActivePlanIdea(idea);
                            setIsPlanModalOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* Interactive features sections */}
          <HowItWorks />

        </main>
      </div>

      {/* Footer Content */}
      <Footer />

      {/* Business formulation plan generation overlay */}
      <BusinessPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false);
          setActivePlanIdea(null);
        }}
        idea={activePlanIdea}
        budget={budget}
        location={location}
        currency={currency}
      />
    </div>
  );
}

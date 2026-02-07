import React, { useState } from 'react';
import { Search, BookOpen, ArrowRight, Grid3x3, ListVideo } from 'lucide-react';
import { HoleBackground } from './HoleBackground';
import VideoViewer from './components/VideoViewer';
import VideoGrid from './components/VideoGrid';

const NUDGE_MESSAGES = [
  "Hey, shouldn't you be studying? Try searching something academic!",
  "ComPost is for learning! How about a math or science question?",
  "Time to lock in! Try searching a topic from your classes.",
  "Your GPA called... it misses you. Try an educational search!",
  "Procrastination detected! Search something you'll thank yourself for later.",
];

export default function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [nudge, setNudge] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'grid'

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setSearched(true);
    setNudge(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Search failed");
      }

      const data = await res.json();
      setResults(data.results);

      if (data.nudge) {
        const msg = NUDGE_MESSAGES[Math.floor(Math.random() * NUDGE_MESSAGES.length)];
        setNudge(msg);
      }
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const hasResults = results.length > 0 && !loading;

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden">

      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-0">
        <HoleBackground
          strokeColor="#34d399"             // Emerald Green lines
          particleRGBColor={[52, 211, 153]} // Emerald Green particles [R, G, B]
        />
        <div className="absolute inset-0 bg-black/40 pointer-events-none z-[8]"></div>
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10">

        <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md fixed w-full z-50">
          <div className="w-full px-6 sm:px-12"> 
            <div className="relative flex items-center justify-between h-16">
              
              {/* LEFT: ComPost Logo */}
              <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer z-10">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-200">
                  ComPost
                </span>
              </div>

              {/* RIGHT: View Toggle and Info Button */}
              <div className="flex items-center gap-2">
                {hasResults && (
                  <button
                    onClick={() => setViewMode(viewMode === 'single' ? 'grid' : 'single')}
                    className="p-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 hover:border-white/20 transition-all group"
                    aria-label={`Switch to ${viewMode === 'single' ? 'grid' : 'single'} view`}
                    title={`Switch to ${viewMode === 'single' ? 'grid' : 'single'} view`}
                  >
                    {viewMode === 'single' ? (
                      <Grid3x3 className="w-5 h-5 text-slate-300 group-hover:text-emerald-400 transition-colors" />
                    ) : (
                      <ListVideo className="w-5 h-5 text-slate-300 group-hover:text-emerald-400 transition-colors" />
                    )}
                  </button>
                )}
                <button 
                  onClick={() => setShowInfo(true)}
                  className="text-sm text-slate-400 hover:text-emerald-400 transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                >
                  How are videos ranked?
                </button>
              </div>

            </div>
          </div>
        </nav>

        {!hasResults ? (
          /* --- INITIAL SEARCH VIEW --- */
          <main className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-16 pb-8">
            <div className="text-center max-w-3xl mx-auto space-y-8 animate-fade-in-up w-full">

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-xl">
                Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Hidden Gems</span> of Education.
              </h1>

              <div className="w-full max-w-2xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-emerald-600 rounded-2xl opacity-50 group-hover:opacity-75 blur transition duration-500"></div>
                <form onSubmit={handleSearch} className="relative bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl flex items-center p-2 transition-all group-hover:border-white/20">
                  <div className="pl-4 text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <input
                    type="text"
                    className="w-full bg-transparent border-none text-white text-lg px-4 py-3 focus:outline-none focus:ring-0 placeholder:text-slate-400"
                    placeholder="Ex: 'How to calculate eigenvectors'..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !searchQuery.trim()}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg px-6 py-3 font-medium transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Searching...' : 'Search'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </div>

              {error && (
                <div className="text-red-400 text-center mt-4">
                  {error}
                </div>
              )}

              {nudge && (
                <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4 max-w-2xl mx-auto">
                  <p className="text-yellow-400 font-medium mb-2">{nudge}</p>
                  <button 
                    onClick={() => setNudge(null)}
                    className="text-sm text-yellow-400 hover:text-yellow-300 underline"
                  >
                    Okay, I'll lock in
                  </button>
                </div>
              )}

              {loading && (
                <div className="text-center mt-8">
                  <div className="inline-block w-10 h-10 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-400">Searching & analyzing transcripts...</p>
                </div>
              )}

              {!loading && searched && results.length === 0 && !error && (
                <p className="text-slate-400 mt-8">No results found. Try a different question.</p>
              )}

            </div>
          </main>
        ) : (
          /* --- RESULTS VIEW --- */
          <main className="flex flex-col min-h-screen pt-16">
            {/* Compact Search Bar */}
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-4">
              <div className="max-w-4xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-emerald-600 rounded-lg opacity-30 group-hover:opacity-50 blur transition duration-300"></div>
                  <form onSubmit={handleSearch} className="relative bg-black/60 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl flex items-center p-1.5 transition-all group-hover:border-white/20">
                    <div className="pl-3 text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      className="w-full bg-transparent border-none text-white text-sm px-3 py-2 focus:outline-none focus:ring-0 placeholder:text-slate-400"
                      placeholder="Search again..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !searchQuery.trim()}
                      className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-md px-4 py-2 text-sm font-medium transition-all flex items-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Searching...' : 'Search'}
                      {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Error and Nudge Messages */}
            {error && (
              <div className="text-red-400 text-center px-4 pb-2">
                {error}
              </div>
            )}

            {nudge && (
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 max-w-4xl mx-auto mb-4 mx-4 sm:mx-6 lg:mx-8">
                <p className="text-yellow-400 font-medium text-sm mb-1">{nudge}</p>
                <button 
                  onClick={() => setNudge(null)}
                  className="text-xs text-yellow-400 hover:text-yellow-300 underline"
                >
                  Okay, I'll lock in
                </button>
              </div>
            )}

            {/* Video Container - Grid or Single View */}
            {viewMode === 'single' ? (
              <div className="flex-1 overflow-hidden px-4 sm:px-6 lg:px-8 pb-8">
                <VideoViewer videos={results} />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">
                <div className="max-w-7xl mx-auto">
                  <VideoGrid videos={results} />
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowInfo(false)}
        >
          <div 
            className="bg-black/90 border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">
              How Videos Are Ranked
            </h2>
            <p className="text-slate-300 mb-6">Each video gets a <strong>Score</strong> from 0-100 based on three factors:</p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Underdog (40%)</h3>
                <p className="text-slate-400 text-sm">Videos with fewer views score higher. This helps surface small creators who make great content but haven't been picked up by the algorithm yet.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Engagement (30%)</h3>
                <p className="text-slate-400 text-sm">The like-to-view ratio. A video with 50 likes and 200 views scores higher than one with 1,000 likes and 500,000 views. High engagement means the audience genuinely valued the content.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Clarity (30%)</h3>
                <p className="text-slate-400 text-sm">We analyze the video's transcript for filler words ("um", "uh", "like") and how structured the speech is. Fewer filler words and consistent sentence structure = a clearer teacher.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">Smart Timestamp</h3>
                <p className="text-slate-400 text-sm">We scan the transcript to find the moment most relevant to your question. The video embed starts right at that point — so you skip intros and get straight to the answer.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

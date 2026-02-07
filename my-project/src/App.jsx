import React, { useState } from 'react';
import { Search, BookOpen, Video, Users, Menu, X, ArrowRight } from 'lucide-react';
import { HoleBackground } from './HoleBackground';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      alert(`Searching for: ${searchQuery}`);
    }, 1000);
  };

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
          {/* FIX: Changed 'max-w-7xl mx-auto' to 'w-full' so it spans the whole screen */}
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

            </div>
          </div>
        </nav>

        <main className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center max-w-3xl mx-auto space-y-8 animate-fade-in-up">

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
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg px-6 py-3 font-medium transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                  {!isSearching && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
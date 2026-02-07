import { useState } from "react";
import SearchBar from "./components/SearchBar";
import VideoGrid from "./components/VideoGrid";

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

  async function handleSearch(query) {
    setLoading(true);
    setError(null);
    setSearched(true);
    setNudge(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
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

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">ComPost</h1>
        <p className="tagline">
          Discover underrated teachers. Skip the algorithm. Go straight to the good stuff.
        </p>
        <button className="info-btn" onClick={() => setShowInfo(true)}>
          How are videos ranked?
        </button>
      </header>

      {showInfo && (
        <div className="info-overlay" onClick={() => setShowInfo(false)}>
          <div className="info-modal" onClick={(e) => e.stopPropagation()}>
            <button className="info-close" onClick={() => setShowInfo(false)}>x</button>
            <h2>How Videos Are Ranked</h2>
            <p>Each video gets a <strong>Score</strong> from 0-100 based on three factors:</p>
            <div className="info-section">
              <h3>Underdog (40%)</h3>
              <p>Videos with fewer views score higher. This helps surface small creators who make great content but haven't been picked up by the algorithm yet.</p>
            </div>
            <div className="info-section">
              <h3>Engagement (30%)</h3>
              <p>The like-to-view ratio. A video with 50 likes and 200 views scores higher than one with 1,000 likes and 500,000 views. High engagement means the audience genuinely valued the content.</p>
            </div>
            <div className="info-section">
              <h3>Clarity (30%)</h3>
              <p>We analyze the video's transcript for filler words ("um", "uh", "like") and how structured the speech is. Fewer filler words and consistent sentence structure = a clearer teacher.</p>
            </div>
            <div className="info-section">
              <h3>Smart Timestamp</h3>
              <p>We scan the transcript to find the moment most relevant to your question. The video embed starts right at that point — so you skip intros and get straight to the answer.</p>
            </div>
          </div>
        </div>
      )}

      <SearchBar onSearch={handleSearch} loading={loading} />

      {error && <p className="error">{error}</p>}

      {nudge && (
        <div className="nudge">
          <p>{nudge}</p>
          <button onClick={() => setNudge(null)}>Okay, I'll lock in</button>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner" />
          <p>Searching & analyzing transcripts...</p>
        </div>
      )}

      {!loading && searched && results.length === 0 && !error && (
        <p className="no-results">No results found. Try a different question.</p>
      )}

      {!loading && results.length > 0 && <VideoGrid videos={results} />}
    </div>
  );
}

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
      </header>

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

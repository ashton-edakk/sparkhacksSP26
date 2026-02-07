import { useState } from "react";

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim() && !loading) {
      onSearch(query.trim());
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask a question... e.g. 'how does photosynthesis work?'"
        disabled={loading}
      />
      <button type="submit" disabled={loading || !query.trim()}>
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}

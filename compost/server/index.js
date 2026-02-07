require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { searchVideos } = require("./youtube");
const { fetchTranscript, analyzeTranscriptQuality, findBestTimestamp } = require("./transcript");
const { scoreVideos } = require("./scorer");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Query is required" });
    }

    console.log(`Searching for: "${query}"`);

    // 1. Search YouTube
    const videos = await searchVideos(query, 15);
    console.log(`Found ${videos.length} videos`);

    // 2. Fetch transcripts and analyze (in parallel)
    const enriched = await Promise.all(
      videos.map(async (video) => {
        const transcript = await fetchTranscript(video.id);
        const { qualityScore } = analyzeTranscriptQuality(transcript);
        const bestTimestamp = findBestTimestamp(transcript, query);

        return {
          ...video,
          transcriptQuality: qualityScore,
          startAt: bestTimestamp,
          hasTranscript: transcript !== null,
        };
      })
    );

    // 3. Score and rank
    const scored = scoreVideos(enriched);
    scored.sort((a, b) => b.scores.total - a.scores.total);

    // Return top 12
    const results = scored.slice(0, 12);
    console.log(`Returning ${results.length} ranked results`);

    res.json({ results, query });
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: "Search failed. Check your API key and try again." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ComPost server running on http://localhost:${PORT}`);
});

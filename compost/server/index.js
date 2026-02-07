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

    // Detect non-academic queries and flag for nudge
    const nonAcademic = [
      // Gaming
      "minecraft", "fortnite", "roblox", "valorant", "league of legends",
      "apex legends", "gta", "call of duty", "cod", "overwatch", "zelda",
      "mario", "pokemon", "elden ring", "smash bros", "fifa", "madden",
      "nba 2k", "among us", "lethal company", "baldurs gate", "skyrim",
      "gaming", "gameplay", "speedrun", "walkthrough", "playthrough",
      // Social media & streaming
      "tiktok", "instagram", "snapchat", "twitter", "twitch", "streamer",
      "youtube drama", "influencer", "viral", "trending", "challenge",
      // Entertainment
      "movie", "trailer", "netflix", "hulu", "disney plus", "anime",
      "manga", "kpop", "k-pop", "celebrity", "gossip", "drama",
      "reality tv", "bachelor", "love island",
      // Music
      "music", "song", "lyrics", "album", "concert", "playlist",
      "rapper", "drake", "taylor swift", "kendrick",
      // Other non-academic
      "vlog", "mukbang", "asmr", "prank", "unboxing", "haul",
      "meme", "funny", "compilation", "react", "reaction","sushi",
    ];
    const lower = query.toLowerCase();
    const isOffTopic = nonAcademic.some((word) => lower.includes(word));

    // Nudge YouTube toward educational results
    const educationalQuery = `${query} explained tutorial`;
    console.log(`Searching for: "${educationalQuery}"`);

    // 1. Search YouTube
    const videos = await searchVideos(educationalQuery, 15);
    console.log(`Found ${videos.length} videos`);

    // 2. Fetch transcripts and analyze (in parallel)
    const enriched = await Promise.all(
      videos.map(async (video) => {
        const transcript = await fetchTranscript(video.id);
        const { qualityScore } = analyzeTranscriptQuality(transcript);
        const bestTimestamp = findBestTimestamp(transcript, query);

        // Log timestamp for debugging
        if (bestTimestamp > 0) {
          const minutes = Math.floor(bestTimestamp / 60);
          const seconds = bestTimestamp % 60;
          console.log(`Video "${video.title.substring(0, 50)}": Found timestamp at ${minutes}:${String(seconds).padStart(2, '0')} for query "${query}"`);
        }

        return {
          ...video,
          transcriptQuality: qualityScore,
          startAt: bestTimestamp,
          hasTranscript: transcript !== null,
        };
      })
    );

    // 3. Filter out videos over 250K views
    const filtered = enriched.filter((v) => v.viewCount < 250000);

    // 4. Score and rank
    const scored = scoreVideos(filtered);
    scored.sort((a, b) => b.scores.total - a.scores.total);

    // Return top 12
    const results = scored.slice(0, 12);
    console.log(`Returning ${results.length} ranked results`);

    res.json({ results, query, nudge: isOffTopic });
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: "Search failed. Check your API key and try again." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ComPost server running on http://localhost:${PORT}`);
});

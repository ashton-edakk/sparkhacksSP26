const { YoutubeTranscript } = require("youtube-transcript");

const FILLER_WORDS = [
  "um", "uh", "like", "you know", "basically", "actually",
  "literally", "right", "so yeah", "i mean", "kind of", "sort of",
];

async function fetchTranscript(videoId) {
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    return segments.map((s) => ({
      text: s.text,
      offset: Math.floor(s.offset / 1000), // convert ms to seconds
      duration: Math.floor(s.duration / 1000),
    }));
  } catch {
    return null; // no transcript available
  }
}

function analyzeTranscriptQuality(segments) {
  if (!segments || segments.length === 0) {
    return { qualityScore: 0.5, fillerDensity: 0, avgSentenceLength: 0 };
  }

  const fullText = segments.map((s) => s.text).join(" ").toLowerCase();
  const words = fullText.split(/\s+/);
  const wordCount = words.length;

  if (wordCount === 0) return { qualityScore: 0.5, fillerDensity: 0, avgSentenceLength: 0 };

  // Filler word density (lower = better)
  let fillerCount = 0;
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, "gi");
    const matches = fullText.match(regex);
    if (matches) fillerCount += matches.length;
  }
  const fillerDensity = fillerCount / wordCount;

  // Sentence length consistency (lower variance = more structured)
  const sentences = fullText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceLengths = sentences.map((s) => s.trim().split(/\s+/).length);
  const avgLen = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length || 0;
  const variance = sentenceLengths.reduce((sum, len) => sum + (len - avgLen) ** 2, 0) / sentenceLengths.length || 0;
  const normalizedVariance = Math.min(variance / 200, 1); // cap at 1

  // Quality score: low filler + low variance = high quality
  const fillerScore = Math.max(0, 1 - fillerDensity * 20); // penalize heavily
  const coherenceScore = Math.max(0, 1 - normalizedVariance);
  const qualityScore = fillerScore * 0.6 + coherenceScore * 0.4;

  return { qualityScore, fillerDensity, avgSentenceLength: avgLen };
}

function findBestTimestamp(segments, query) {
  if (!segments || segments.length === 0) return 0;

  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  // Score each window of ~5 consecutive segments
  const windowSize = 5;
  let bestScore = -1;
  let bestOffset = 0;

  for (let i = 0; i <= segments.length - windowSize; i++) {
    const windowText = segments
      .slice(i, i + windowSize)
      .map((s) => s.text)
      .join(" ")
      .toLowerCase();

    let score = 0;
    for (const word of queryWords) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = windowText.match(regex);
      if (matches) score += matches.length;
    }

    if (score > bestScore) {
      bestScore = score;
      bestOffset = segments[i].offset;
    }
  }

  return bestOffset;
}

module.exports = { fetchTranscript, analyzeTranscriptQuality, findBestTimestamp };

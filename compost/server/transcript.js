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

  // Remove common stop words but keep important terms
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", 
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "be", 
    "been", "being", "have", "has", "had", "do", "does", "did", "will", 
    "would", "could", "should", "may", "might", "must", "can", "this", 
    "that", "these", "those", "i", "you", "he", "she", "it", "we", "they",
    "what", "which", "who", "when", "where", "why", "how", "all", "each",
    "every", "both", "few", "more", "most", "other", "some", "such", "no",
    "nor", "not", "only", "own", "same", "so", "than", "too", "very"
  ]);

  // Extract meaningful query words (remove stop words, keep words 2+ chars)
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !stopWords.has(w))
    .map((w) => w.replace(/[^\w]/g, "")) // Remove punctuation
    .filter((w) => w.length >= 2);

  if (queryWords.length === 0) {
    // If all words are stop words, use the original query words
    const fallbackWords = query.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);
    if (fallbackWords.length === 0) return 0;
    queryWords.push(...fallbackWords);
  }

  // Use a larger window (10 segments ~= 30-60 seconds) for better context
  const windowSize = 10;
  let bestScore = -1;
  let bestOffset = 0;
  let bestWindowIndex = 0;

  // Score each window
  for (let i = 0; i <= segments.length - windowSize; i++) {
    const window = segments.slice(i, i + windowSize);
    const windowText = window.map((s) => s.text).join(" ").toLowerCase();

    let score = 0;
    let matchedWords = 0;

    // Score based on:
    // 1. Number of unique query words found
    // 2. Frequency of matches (weighted)
    // 3. Proximity bonus (words appearing close together)
    for (const word of queryWords) {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "gi");
      const matches = windowText.match(regex);
      if (matches) {
        matchedWords++;
        // Weight by frequency, but with diminishing returns
        score += Math.min(matches.length * 2, 10);
      }
    }

    // Bonus for matching multiple unique words
    const uniqueMatchBonus = (matchedWords / queryWords.length) * 20;
    score += uniqueMatchBonus;

    // Prefer earlier timestamps if scores are similar (within 10%)
    if (score > bestScore || (score >= bestScore * 0.9 && segments[i].offset < bestOffset)) {
      bestScore = score;
      bestOffset = segments[i].offset;
      bestWindowIndex = i;
    }
  }

  // If we found a good match, return it
  if (bestScore > 0) {
    // Add a small buffer (2 seconds) to avoid cutting off mid-sentence
    return Math.max(0, bestOffset - 2);
  }

  // Fallback: if no good match, try to find any mention of query words
  // and return the first occurrence
  for (let i = 0; i < segments.length; i++) {
    const segmentText = segments[i].text.toLowerCase();
    for (const word of queryWords) {
      if (segmentText.includes(word)) {
        return Math.max(0, segments[i].offset - 2);
      }
    }
  }

  // Last resort: return 0 (start of video)
  return 0;
}

module.exports = { fetchTranscript, analyzeTranscriptQuality, findBestTimestamp };

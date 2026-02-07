const { google } = require("googleapis");

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

async function searchVideos(query, maxResults = 20) {
  // Search for videos matching the query
  const searchRes = await youtube.search.list({
    part: "snippet",
    q: query,
    type: "video",
    maxResults,
    relevanceLanguage: "en",
    videoCaption: "closedCaption", // only videos with captions
  });

  const videoIds = searchRes.data.items.map((item) => item.id.videoId);

  if (videoIds.length === 0) return [];

  // Fetch detailed stats for each video
  const statsRes = await youtube.videos.list({
    part: "statistics,snippet,contentDetails",
    id: videoIds.join(","),
  });

  return statsRes.data.items.map((video) => ({
    id: video.id,
    title: video.snippet.title,
    channelTitle: video.snippet.channelTitle,
    description: video.snippet.description,
    thumbnail: video.snippet.thumbnails.medium.url,
    publishedAt: video.snippet.publishedAt,
    viewCount: parseInt(video.statistics.viewCount || "0", 10),
    likeCount: parseInt(video.statistics.likeCount || "0", 10),
    duration: video.contentDetails.duration,
  }));
}

module.exports = { searchVideos };

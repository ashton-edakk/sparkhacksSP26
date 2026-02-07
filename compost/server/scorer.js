function normalize(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map((v) => (v - min) / (max - min));
}


function normalize(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map((v) => (v - min) / (max - min));
}




async function scoreVideos(videos) {
  if (videos.length === 0) return [];

  const viewCounts = videos.map((v) => v.viewCount);
  const normalizedViews = normalize(viewCounts);

   const sentimentScores = await Promise.all(
     videos.map(async (video) => {
       try {
         const sentiment = await getSentiment(video.id);
         return Math.min(Math.max(sentiment, 0), 1);
       } catch (err) {
         console.error(`Sentiment error for ${video.id}:`, err);
         return 0.5; // Default neutral
       }
     })
   );


  return videos.map((video, i) => {
    // Underdog score: lower views = higher score (40%)
    const underdogScore = 1 - normalizedViews[i];

    // Engagement score: likes per view (30%)
    const engagementScore =
      video.viewCount > 0
        ? Math.min(video.likeCount / video.viewCount, 1)
        : 0;

    // Transcript quality score (30%)
    const transcriptScore = video.transcriptQuality || 0.5;

    //const sentimentScore = sentimentScores[i];

    // Composite score
    const totalScore =
      underdogScore * 0.4 +
      engagementScore * 0.2 +
      transcriptScore * 0.3 +
      sentimentScore * 0.1

    return {
      ...video,
      scores: {
        underdog: Math.round(underdogScore * 100),
        engagement: Math.round(engagementScore * 100),
        transcript: Math.round(transcriptScore * 100),
        total: Math.round(totalScore * 100),
      },
    };
  });
}

module.exports = { scoreVideos };

function normalize(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map((v) => (v - min) / (max - min));
}

function scoreVideos(videos) {
  if (videos.length === 0) return [];

  const viewCounts = videos.map((v) => v.viewCount);
  const normalizedViews = normalize(viewCounts);

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

    // Composite score
    const totalScore =
      underdogScore * 0.4 +
      engagementScore * 0.3 +
      transcriptScore * 0.3;

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

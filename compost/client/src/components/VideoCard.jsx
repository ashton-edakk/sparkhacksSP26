function formatViews(count) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K views`;
  return `${count} views`;
}

function formatTimestamp(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function VideoCard({ video }) {
  const embedUrl = `https://www.youtube.com/embed/${video.id}?start=${video.startAt || 0}&rel=0`;
  const youtubeUrl = video.startAt
    ? `https://www.youtube.com/watch?v=${video.id}&t=${video.startAt}s`
    : `https://www.youtube.com/watch?v=${video.id}`;

  return (
    <div className="video-card">
      <div className="video-embed">
        <iframe
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>
        <p className="video-channel">{video.channelTitle}</p>

        <div className="video-meta">
          <span className="views">{formatViews(video.viewCount)}</span>
          {video.startAt > 0 && (
            <span className="timestamp">Starts at {formatTimestamp(video.startAt)}</span>
          )}
        </div>

        <div className="score-badges">
          <span className="badge total" title="Overall score">
            Score: {video.scores.total}
          </span>
          <span className="badge underdog" title="Underdog score (lower views = higher)">
            Underdog: {video.scores.underdog}
          </span>
          <span className="badge engagement" title="Like-to-view ratio">
            Engagement: {video.scores.engagement}
          </span>
          <span className="badge transcript" title="Transcript quality">
            Clarity: {video.scores.transcript}
          </span>
        </div>

        <a
          className="youtube-link"
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Watch on YouTube
        </a>
      </div>
    </div>
  );
}

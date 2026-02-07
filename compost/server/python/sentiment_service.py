import sys
import json
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from youtube_comments import get_comments

analyzer = SentimentIntensityAnalyzer()


def analyze(video_id):

    comments = get_comments(video_id, 200)

    if not comments:
        return {"sentiment": 0, "comment_count": 0}

    scores = []

    for comment in comments:
        sentiment = analyzer.polarity_scores(comment)
        scores.append(sentiment["compound"])

    avg_sentiment = sum(scores) / len(scores)

    return {
        "video_id": video_id,
        "sentiment": avg_sentiment,
        "comment_count": len(comments)
    }


if __name__ == "__main__":

    video_id = sys.argv[1]

    result = analyze(video_id)

    print(json.dumps(result))


import os
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("YOUTUBE_API_KEY")

youtube = build("youtube", "v3", developerKey=API_KEY)


def get_comments(video_id, max_comments=100):

    comments = []
    next_page = None

    while len(comments) < max_comments:

        request = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=100,
            pageToken=next_page,
            textFormat="plainText"
        )

        response = request.execute()

        for item in response["items"]:
            comment = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
            comments.append(comment)

        next_page = response.get("nextPageToken")

        if not next_page:
            break

    return comments[:max_comments]

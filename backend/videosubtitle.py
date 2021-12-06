from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter



def get_transcript_from_youtube(videoId):
  transcript = YouTubeTranscriptApi.get_transcript(videoId)
  formatter = TextFormatter()
  text_formatted = formatter.format_transcript(transcript)
  print(text_formatted)
  return text_formatted
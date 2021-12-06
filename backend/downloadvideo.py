from pytube import YouTube
import pathlib
import os

def youtube_video_download(data):
    
    parent_dir = os.getcwd()
    directory = "static/videos"
    path = os.path.join(parent_dir, directory)
    
    video = YouTube(data)
    print(video)
    video_streams = video.streams.filter(file_extension='mp4').get_by_itag(18)
    location = pathlib.Path(r"/static/videos/")
    video_streams.download(filename = "my.mp4", output_path = path)
    print(path)
    print('download completed')


    

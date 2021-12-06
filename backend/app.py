from flask import Flask,request, jsonify,render_template
from flask_cors import CORS
from pathlib import Path
from modzy import ApiClient
from modzy._util import file_to_bytes
import json
import pathlib
import sys
import datetime
import database
from convert import convert_base64_to_png
from youtube import searchVideoForKeyword
from downloadvideo import youtube_video_download
from videosubtitle import get_transcript_from_youtube



app = Flask(__name__, static_folder='/static')

client = ApiClient(base_url="https://app.modzy.com/api", api_key="0c3xRYz75294DtGZu61o.lmSON2OEDAFESTMtMd0K")


database.create_tables()

CORS(app)
@app.route('/', methods=["POST"])
def hello():
    
    data = request.json
    ##print(data)
    for i in enumerate(data):
        ##print(i)
        base64_string = i[1][22:]
        ##print(base64_string)
        ##print(type(data))
        l = str(i[0])+'.png'
        source = convert_base64_to_png(l,base64_string)

    
    job = client.jobs.submit_file("c60c8dbd79", "0.0.2", source)
    ##print(f"job: {job}")

    ocr_result = client.results.block_until_complete(job, timeout=None)

    sorted_results = []
    for result in ocr_result["results"]:
        sorted_results.append(result)
    sorted_results.sort()

    full_text = ""
    text_sources = {}
    for result in sorted_results:
        name = 1
        text = ocr_result["results"][result]["results.json"]['text']
        full_text += text +"\n\n\n"
        #Add any number of inputs
        text_sources[str(name)] = {"input.txt": text,}
        name = name + 1

    

    job = client.jobs.submit_text("rs2qqwbjwb", "0.0.2", text_sources)
     
    result_summary = client.results.block_until_complete(job, timeout=None)
    results_json_summary = result_summary.get_first_outputs()['results.json']
   
    
    
    job = client.jobs.submit_text("m8z2mwe3pt", "0.0.1", text_sources)
    ##result = client.results.block_until_complete(job, timeout=None)
    result = client.results.block_until_complete(job, timeout=None)
    results_json = result.get_first_outputs()['results.json']
    
    s_links = []
    words = []
    for result in results_json:
        words.append(result)
        links = searchVideoForKeyword(result)
        s_links.append(links[0])
    output_videos = dict(zip(words, s_links))        

    job = client.jobs.submit_text("ed542963de", "1.0.1", text_sources)
    result = client.results.block_until_complete(job, timeout=None)
    results_json_sentiment = result.get_first_outputs()['results.json']['data']['result']
    ##print(results_json_sentiment.classPredictions)

    database.create_entry(full_text, results_json_summary.summary, datetime.datetime.today().strftime("%b %d"))
    return jsonify({'data':results_json_summary.summary},{'original':full_text},{'youtube_links':output_videos},{'sentiment_data':results_json_sentiment})


@app.route('/video', methods=["POST"])
def video_caption():
    data = request.json
    youtube_video_download(data)
    print(data)
    
    sources = {}
    #Add any number of inputs
    video_path = pathlib.Path(r'static/videos/my.mp4')

    sources["my-input"] = {
        "input": file_to_bytes(video_path.resolve()),
    }
    #Once you are ready, submit the job
    job = client.jobs.submit_file("cyoxn54q5g", "0.0.2", sources)
    
    result = client.results.block_until_complete(job, timeout=None)
    results_json = result.get_first_outputs()['results.json']
    print(results_json.caption)

    return jsonify({'caption':results_json.caption})



@app.route('/videosummary', methods=["POST"])
def video_summary():
    data = request.json
    text = get_transcript_from_youtube(data)
    sources = {}
    #Add any number of inputs
    sources["my-input"] = {
        "input.txt": text,
    }
    #Once you are ready, submit the job
    job = client.jobs.submit_text("rs2qqwbjwb", "0.0.2", sources)
    print(f"job: {job}")

    ##result = client.results.block_until_complete(job, timeout=None)
    result = client.results.block_until_complete(job, timeout=None)
    results_json = result.get_first_outputs()['results.json']
    print(results_json.summary)
    return jsonify({'videodata':results_json.summary})



@app.route("/dashboard", methods=["GET"])
def dashboard():         
    return render_template('dashboard.html', entries=database.retrieve_entries() )
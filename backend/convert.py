import os
import base64
from modzy._util import file_to_bytes
from modzy import ApiClient
import pathlib
import json

##client = ApiClient(base_url="https://app.modzy.com/api", api_key="wVGXqOXtZQgJZumVOuem.3HjA7Nse15JsrLqvC9EG")

sources = {}

def convert_base64_to_png(file_name,base64_string):
    config_bytes = json.dumps({"languages":["eng"]}).encode('utf-8')
    
    ##file_path = os.path.join(os.getcwd(), "/static/img",file_name)
    
    file_path = "static/img/" + file_name
    
    image_binary=base64.b64decode(str(base64_string))
    ###print(base64_string)
    with open(file_path,'wb') as f:
        f.write(image_binary)  

    image_path = pathlib.Path( r'static/img/'+file_name)
    image_bytes = file_to_bytes(image_path.resolve())

    sources[str(file_name)] = {
        "input": image_bytes,
        "config.json": config_bytes,
    }

    return sources








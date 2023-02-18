from flask import Flask, jsonify, request
import openai
import json
from string import Template
import requests
import time
from copy import deepcopy
import sys
import yaml


with open("./config.yml", "r") as f:
    config = yaml.safe_load(f)

openai.api_key = config["OPENAI_API_KEY"]
HEADERS = {
    'X-AYLIEN-NewsAPI-Application-ID': config["NEWSAPI_APP_ID"], 
    'X-AYLIEN-NewsAPI-Application-Key': config["NEWSAPI_APP_KEY"],
}

app = Flask(__name__)

#########################################
## Endpoint for converting text to an AQL
#########################################

with open('prompt-aql.txt', 'r') as f:
    prompt_aql = Template(f.read())

@app.route("/api/text2aql")
def text2aql():
    text = request.args.get("text")
    if not text:
        return jsonify({"error": "Parameter 'text' is required."}), 400
    
    aql = convert_text2aql(text)
    response = jsonify({"aql": aql})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

def convert_text2aql(text):
    try:
        aql = openai.Completion.create(
            model="text-davinci-003",
            prompt=prompt_aql.substitute({'prompt': text}),
            max_tokens=256,
            temperature=0.7
        )
        if aql['choices'] and len(aql['choices']) > 0:
            return aql['choices'][0]['text']
        return "No compute"
    except:
        return "OpenAI API error"

#####################################
## Endpoint for summarizing headlines
#####################################

with open('prompt-summarize.txt', 'r') as f:
    prompt_summary = Template(f.read())

@app.route("/api/summarize")
def summarize():
    headlines = request.args.get("headlines")
    if not headlines:
        return jsonify({"error": "Parameter 'headlines' is required."}), 400
    
    num_sentences = request.args.get("num_sentences", 3)
    
    summary = sumarize_headlines(headlines, num_sentences)
    response = jsonify({"summary": summary})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

def sumarize_headlines(headlines, num_sentences):
    try:
        summary = openai.Completion.create(
            model="text-davinci-003",
            prompt=prompt_summary.substitute({'headlines': headlines, 'num_sentences': num_sentences}),
            max_tokens=512,
            temperature=0.7
        )
        if summary['choices'] and len(summary['choices']) > 0:
            return summary['choices'][0]['text']
        return "No compute"
    except:
        return "OpenAI API error"

######################################
## Endpoint for fetching news articles
######################################

STORIES_ENDPOINT = 'https://api.aylien.com/news/stories'

@app.route("/api/fetchnews")
def fetchnews():
    aql = request.args.get("aql")
    
    if not aql:
        return jsonify({"error": "Parameter 'aql' is required."}), 400
    
    try:
        params = json.loads(request.args.get("params"))
    except:
        params = {}
        
    num_articles = request.args.get("num_articles", 10)
    
    stories = retrieve_stories({"aql": aql, "language": "en", **params, **{"per_page": num_articles}})
    response = jsonify({"stories": stories})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

def retrieve_stories(params,
                     n_pages=1,
                     headers=HEADERS,
                     endpoint=STORIES_ENDPOINT,
                     sleep=None):
    params = deepcopy(params)
    stories = []
    cursor = '*'
    for i in range(n_pages):
        params['cursor'] = cursor
        response = requests.get(
            endpoint,
            params,
            headers=headers
        )

        data = json.loads(response.text)
        if response.status_code != 200:
            return []
        
        stories += data['stories']
        if data.get('next_page_cursor', '*') != cursor:
            cursor = data['next_page_cursor']
            if sleep is not None:
                time.sleep(sleep)
        else:
            break
    return stories

########################

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
    

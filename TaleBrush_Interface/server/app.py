# TaleBrush 
# Copyright (c) 2022-present NAVER Corp.
# GPLv3

'''server/app.py - main api app declaration'''
from flask import Flask, jsonify, send_from_directory, request, g
from flask_cors import CORS
import sqlite3
import os 
import json
import datetime
import llm
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE=os.path.join(BASE_DIR, '../database.db')

'''Main wrapper for app creation'''
app = Flask(__name__, static_folder='../build')
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False

print("Server running!")

def get_db():
    if 'sqlite_db' not in g:
        g.sqlite_db = sqlite3.connect(DATABASE)
        g.sqlite_db.execute('''CREATE TABLE IF NOT EXISTS DataDump (
            DataId INTEGER PRIMARY KEY NOT NULL, User NVARCHAR(50) NOT NULL,
            Data TEXT NULL, Datetime DATETIME NULL, Action NVARCHAR(50) NULL)''')
    return g.sqlite_db

@app.teardown_appcontext
def close_connection(exception):
    db = g.pop('sqlite_db', None)
    if db is not None:
        db.close()

##
# API routes
##

@app.route('/api/storeEvent', methods=['GET', 'POST'])
def storeEvent():
  '''storing...'''
  if request.method == 'POST':
    d = json.loads(request.get_data())
    conn = get_db()
    c_state = json.dumps(d['c_state'])
    t = datetime.datetime.now()
    conn.execute('INSERT INTO DataDump (User, Data, Datetime, Action) values (?,?,?,?);', (d['user'], c_state, t, d['action']))
    conn.commit()
    return jsonify({'result': 'success'})
  return jsonify({'result': 'nothing'})

def llm_route(fn):
  '''POST-only wrapper: LLM/provider failures become a readable JSON error instead of a hung UI.'''
  def wrapper():
    if request.method != 'POST':
      return jsonify({'result': 'nothing'})
    try:
      return jsonify(fn(json.loads(request.get_data())))
    except Exception as e:  # pylint: disable=broad-except
      return jsonify({'error': '%s: %s' % (type(e).__name__, str(e)[:300])}), 502
  wrapper.__name__ = fn.__name__
  return wrapper

def _targets(control):
  '''{"Romeo": 80, "Juliet": -1, "_relationship": 30} -> {"Romeo": 80, "Juliet": None, "relationship": 30}'''
  out = {}
  for k, v in control.items():
    v = int(v)
    out['relationship' if k == '_relationship' else k] = v if v >= 0 else None
  return out

def _rate_args(characters, targets):
  return characters, 'relationship' in targets

@app.route('/api/labelSentence', methods=['GET', 'POST'])
@llm_route
def labelSentence(data):
  characters = data['characters']
  values = llm.rate_sentence(data['pre_context'], data['sentence'], characters, bool(data.get('include_relationship')))
  return {'values': values}

def _generate(data, make):
  characters = json.loads(data['characters'])
  targets = _targets(json.loads(data['controls'])[0])
  temperature = json.loads(data['temperature'])[0]
  regeneration = json.loads(data['regeneration'])[0]
  pre = json.loads(data['pre_context'])
  chars, rel = _rate_args(characters, targets)
  prev = data.get('prev_values')
  sentence, ratings = llm.best_of_n(
    lambda: make(pre, targets, temperature, prev, data),
    lambda s: llm.rate_sentence(' '.join(pre[-1:]), s, chars, rel),
    targets, regeneration)
  return {'generated': json.dumps([sentence]), 'values': json.dumps([ratings])}

@app.route('/api/continuingGeneration', methods=['GET', 'POST'])
@llm_route
def continuingGeneration(data):
  return _generate(data, lambda pre, t, temp, prev, d: llm.generate_continuation(pre, t, temp, prev))

@app.route('/api/infillingGeneration', methods=['GET', 'POST'])
@llm_route
def infillingGeneration(data):
  post = json.loads(data['post_context'])
  return _generate(data, lambda pre, t, temp, prev, d: llm.generate_infill(pre, post, t, temp, prev))


##
# View route
##


# @app.route('/', defaults={'path': ''})
@app.route('/talebrush')
def index():
  '''Return index.html for all non-api routes'''
  #pylint: disable=unused-argument
  # print(path)
  # if path != "" and os.path.exists(app.static_folder + '/' + path):
  #   print('oh?')
  #   return send_from_directory(app.static_folder, path)
  # print(app.static_folder)
  return send_from_directory(app.static_folder, 'index.html')


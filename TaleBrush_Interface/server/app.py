# TaleBrush 
# Copyright (c) 2022-present NAVER Corp.
# GPLv3

'''server/app.py - main api app declaration'''
from flask import Flask, jsonify, send_from_directory, _app_ctx_stack, request
from flask_cors import CORS
import sqlite3
import os 
import json
import datetime
import requests
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE=os.path.join(BASE_DIR, '../database.db')

'''Main wrapper for app creation'''
app = Flask(__name__, static_folder='../build')
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False
ML_URL = 'http://[PLACEHOLDER]/'

print("Server running!")

def get_db():
    top = _app_ctx_stack.top
    print(hasattr(top, 'sqlite_db'), DATABASE)
    if not hasattr(top, 'sqlite_db'):
        top.sqlite_db = sqlite3.connect(DATABASE)
    return top.sqlite_db

@app.teardown_appcontext
def close_connection(exception):
    top = _app_ctx_stack.top
    if hasattr(top, 'sqlite_db'):
        top.sqlite_db.close()

##
# API routes
##

@app.route('/api/items')
def items():
  '''Sample API route for data'''
  print('items')
  return jsonify([{'title': 'A'}, {'title': 'B'}])

@app.route('/api/storeEvent', methods=['GET', 'POST'])
def storeEvent():
  '''storing...'''
  if request.method == 'POST':
    # print(request.get_data())
    d = json.loads(request.get_data())
    print(d)
    conn = get_db()
    cursor = get_db().cursor()
    print(get_db())
    # cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    # tables = cursor.fetchall()
    # print(tables)
    c_state = json.dumps(d['c_state'])
    action = d['action']
    user = d['user']
    t = datetime.datetime.now()
    # cursor.execute('INSERT INTO DataDump (User, Data, Action) values (?,?,?);', (user, c_state, action))
    cursor.execute('INSERT INTO DataDump (User, Data, Datetime, Action) values (?,?,?,?);', (user, c_state, t, action))
    conn.commit()
    return jsonify({'result': 'success'})
  return jsonify({'result': 'nothing'})

@app.route('/api/labelSentence', methods=['GET', 'POST'])
def labelSentence():
  '''Sample API route for data'''
  if request.method == 'POST':
    print('data', request.data)
    ret = requests.post(ML_URL+'labelSentence', json= json.loads(request.data))
    # print('ret', ret.json(), 'ret')
    # print(ret.json())
    return jsonify(ret.json())
  return jsonify({'result': 'nothing'})

@app.route('/api/continuingGeneration', methods=['GET', 'POST'])
def continuingGeneration():
  '''Sample API route for data'''
  if request.method == 'POST':
    print(request.data)
    ret = requests.post(ML_URL+'continuingGeneration', json=json.loads(request.data))
    # print('ret', ret.json(), 'ret')
    
    return jsonify(ret.json())
  return jsonify({'result': 'nothing'})

@app.route('/api/infillingGeneration', methods=['GET', 'POST'])
def infillingGeneration():
  '''Sample API route for data'''
  if request.method == 'POST':
    print(request.data)
    ret = requests.post(ML_URL+'infillingGeneration', json=json.loads(request.data))
    print('ret', ret, 'ret')
    return jsonify(ret.json())
  return jsonify({'result': 'nothing'})
  

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
  print(app.static_folder)
  return send_from_directory(app.static_folder, 'index.html')


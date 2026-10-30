# TaleBrush
# Copyright (c) 2022-present NAVER Corp.
# GPLv3

'''API test suite (LLM_MOCK=1: no network)'''
import sys, os, json
os.environ['LLM_MOCK'] = '1'
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from app import app

app.testing = True
client = app.test_client()


def test_label_sentence():
    r = client.post('/api/labelSentence', json={'sentence': 'Hi.', 'pre_context': '', 'characters': ['A', 'B'], 'include_relationship': True})
    v = r.get_json()['values']
    assert set(v) == {'A', 'B', 'relationship'}


def test_continuing_generation():
    r = client.post('/api/continuingGeneration', json={
        'pre_context': json.dumps(['Once.']), 'controls': json.dumps([{'A': 80, 'B': -1, '_relationship': 30}]),
        'characters': json.dumps(['A', 'B']), 'temperature': json.dumps([0.7]), 'regeneration': json.dumps([1])})
    d = r.get_json()
    assert len(json.loads(d['generated'])) == 1 and set(json.loads(d['values'])[0]) == {'A', 'B', 'relationship'}


def test_error_is_readable(monkeypatch):
    os.environ['LLM_MOCK'] = '0'
    monkeypatch.setattr('llm._get_client', lambda: (_ for _ in ()).throw(RuntimeError('no key')))
    try:
        r = client.post('/api/labelSentence', json={'sentence': 'Hi.', 'pre_context': '', 'characters': ['A']})
    finally:
        os.environ['LLM_MOCK'] = '1'
    assert r.status_code == 502 and 'no key' in r.get_json()['error']

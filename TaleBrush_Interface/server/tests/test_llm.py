# TaleBrush
# Copyright (c) 2022-present NAVER Corp.
# GPLv3

'''Unit tests for server/llm.py (OpenAI client mocked, no network).'''
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import pytest
import llm


class FakeClient:
    '''Stands in for openai.OpenAI; replies come from a queue.'''
    def __init__(self, replies):
        self.replies, self.calls = list(replies), []
        self.chat = self
        self.completions = self

    def create(self, **kw):
        self.calls.append(kw)
        text = self.replies.pop(0)
        if isinstance(text, Exception):
            raise text
        msg = type('M', (), {'content': text})
        return type('R', (), {'choices': [type('C', (), {'message': msg})]})


@pytest.fixture
def fake(monkeypatch):
    monkeypatch.delenv('LLM_MOCK', raising=False)
    def install(*replies):
        c = FakeClient(replies)
        monkeypatch.setattr(llm, '_client', c)
        return c
    return install


def test_band_edges():
    assert [llm.band(v) for v in (0, 20, 21, 40, 41, 60, 61, 80, 81, 100)] == [
        'very bad', 'very bad', 'bad', 'bad', 'neutral', 'neutral', 'good', 'good', 'very good', 'very good']
    assert llm.band(150) == 'very good' and llm.band(-5) == 'very bad'


def test_first_sentence():
    assert llm.first_sentence('"He ran home." Then he slept.') == 'He ran home.'
    assert llm.first_sentence('Sentence: She smiled!\nExtra commentary') == 'She smiled!'
    assert llm.first_sentence('No punctuation here') == 'No punctuation here'


def test_parse_json_fallback():
    assert llm.parse_json('{"a": 1}') == {'a': 1}
    assert llm.parse_json('Sure! Here: {"a": 2} hope it helps') == {'a': 2}
    with pytest.raises(ValueError):
        llm.parse_json('no json at all')


def test_rate_sentence_clamps_and_defaults(fake):
    fake('{"Romeo": 140, "Juliet": -9}')  # Juliet below range, relationship not requested
    r = llm.rate_sentence('ctx', 'He sighed.', ['Romeo', 'Juliet'], False)
    assert r == {'Romeo': 100, 'Juliet': 0, 'relationship': None}


def test_rate_sentence_json_mode_fallback(fake):
    c = fake(Exception('response_format not supported'), 'x {"Romeo": 40, "relationship": 70} y')
    r = llm.rate_sentence('', 'Hi.', ['Romeo'], True)
    assert r == {'Romeo': 40, 'relationship': 70}
    assert 'response_format' in c.calls[0] and 'response_format' not in c.calls[1]


def test_generation_prompt_has_bands_and_trims(fake):
    c = fake('"They met at dawn." And more.')
    s = llm.generate_continuation(['It began.'], {'Romeo': 85, 'Juliet': None, 'relationship': 10}, 3.5, {'Romeo': 50})
    assert s == 'They met at dawn.'
    prompt = c.calls[0]['messages'][0]['content']
    assert 'very good (85/100), rising' in prompt and 'very bad (10/100)' in prompt and 'Juliet' not in prompt.split('Target')[1]
    assert c.calls[0]['temperature'] == 2  # clamped


def test_best_of_n_stops_early():
    n = []
    s, r = llm.best_of_n(lambda: n.append(1) or 'a', lambda s: {'A': 55}, {'A': 60}, 4)
    assert (s, r, len(n)) == ('a', {'A': 55}, 1)


def test_best_of_n_caps_and_picks_closest():
    sents = iter(['far', 'near', 'mid', 'far2', 'never'])
    vals = {'far': 0, 'near': 70, 'mid': 30, 'far2': 0, 'never': 60}
    s, r = llm.best_of_n(lambda: next(sents), lambda s: {'A': vals[s]}, {'A': 100}, 9)
    assert s == 'near'  # best of the 4 allowed attempts
    assert next(sents) == 'never'


def test_best_of_n_no_constraints_takes_first():
    n = []
    llm.best_of_n(lambda: n.append(1) or 'a', lambda s: {'A': 1}, {'A': None}, 4)
    assert len(n) == 1

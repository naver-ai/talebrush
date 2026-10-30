# TaleBrush
# Copyright (c) 2022-present NAVER Corp.
# GPLv3

'''server/llm.py - prompt-engineered LLM calls that replace the GPT-Neo/GeDi model server.

targets: {"<character name>": 0-100 or None, ..., "relationship": 0-100 or None}
'''
import json
import os
import random
import re

from dotenv import load_dotenv

load_dotenv()

MAX_ATTEMPTS = 4
DIFF_THRESHOLD = 20  # same stop rule as the original generate-rate-pick loop

FORTUNE_DEF = ("A character's fortune is how well things are going for that character at this point "
               "in the story: 0 = very bad (misfortune, loss, danger), 100 = very good (success, joy, safety).")
RELATIONSHIP_DEF = ("The relationship score describes how the two characters stand with each other: "
                    "0 = hostile or estranged, 50 = neutral, 100 = very close or loving.")

_client = None


def mock_enabled():
    return os.environ.get('LLM_MOCK') == '1'


def _get_client():
    global _client
    if _client is None:
        from openai import OpenAI
        _client = OpenAI(base_url=os.environ.get('LLM_BASE_URL', 'https://api.openai.com/v1'),
                         api_key=os.environ.get('LLM_API_KEY', ''))
    return _client


def band(v):
    '''0-100 -> word band the model can follow.'''
    v = clamp(v)
    for limit, word in ((20, 'very bad'), (40, 'bad'), (60, 'neutral'), (80, 'good')):
        if v <= limit:
            return word
    return 'very good'


def clamp(v, lo=0, hi=100):
    return max(lo, min(hi, v))


def first_sentence(text):
    '''Fallback trim to one sentence of plain prose (like the original cut_into_sentences).'''
    text = (text or '').strip().split('\n')[0].strip()
    text = re.sub(r'^(sentence|story|next sentence)\s*:\s*', '', text, flags=re.I)
    text = text.strip(' "\'“”‘’')
    m = re.search(r'^.*?[.!?]+(?=["\'”’)]*(\s|$))', text)
    return (m.group(0) if m else text).strip()


def parse_json(text):
    '''json.loads, falling back to the first {...} in the text.'''
    try:
        return json.loads(text)
    except (TypeError, ValueError):
        m = re.search(r'\{.*?\}', text or '', re.S)
        if not m:
            raise ValueError('Model did not return JSON: %r' % (text or '')[:200])
        return json.loads(m.group(0))


def _chat(model, prompt, temperature=0.7, json_mode=False):
    kwargs = dict(model=model, temperature=clamp(temperature, 0, 2),
                  messages=[{'role': 'user', 'content': prompt}])
    client = _get_client()
    if json_mode:
        try:
            r = client.chat.completions.create(response_format={'type': 'json_object'}, **kwargs)
        except Exception as e:  # provider without json mode -> plain text, parsed with fallback
            if 'response_format' not in str(e) and 'json' not in str(e).lower():
                raise
            r = client.chat.completions.create(**kwargs)
    else:
        r = client.chat.completions.create(**kwargs)
    return r.choices[0].message.content or ''


def _gen_model():
    return os.environ.get('LLM_MODEL', 'gpt-4o-mini')


def _rater_model():
    return os.environ.get('LLM_RATER_MODEL') or _gen_model()


def _target_lines(targets, prev):
    lines = []
    for name, v in targets.items():
        if v is None or v < 0:
            continue
        what = ('the relationship between the two characters' if name == 'relationship'
                else "%s's fortune" % name)
        line = '- %s: %s (%d/100)' % (what, band(v), v)
        p = (prev or {}).get(name)
        if p is not None:
            d = v - p
            line += ', %s compared to the previous sentence' % ('rising' if d > 7 else 'falling' if d < -7 else 'steady')
        lines.append(line)
    return '\n'.join(lines)


def _gen_prompt(task, context, targets, prev):
    lines = _target_lines(targets, prev)
    return ('You are co-writing a story with an author.\n%s\n%s\n\n%s\n\n'
            'Target for the new sentence:\n%s\n\n'
            'Write exactly ONE sentence of story prose. No quotes around it, no labels, no commentary.'
            % (FORTUNE_DEF, RELATIONSHIP_DEF, task(context), lines or '- (no constraint; continue naturally)'))


def generate_continuation(pre_context, targets, temperature=0.7, prev=None):
    if mock_enabled():
        return _mock_sentence(targets)
    task = lambda c: 'Story so far:\n%s\n\nWrite the next sentence.' % ' '.join(c)
    out = _chat(_gen_model(), _gen_prompt(task, pre_context, targets, prev), temperature)
    return first_sentence(out)


def generate_infill(pre_context, post_context, targets, temperature=0.7, prev=None):
    if mock_enabled():
        return _mock_sentence(targets)

    def task(_):
        return ('Story before the gap:\n%s\n\nStory after the gap:\n%s\n\n'
                'Write the single sentence that goes between them.'
                % (' '.join(pre_context) or '(story start)', ' '.join(post_context) or '(story end)'))
    out = _chat(_gen_model(), _gen_prompt(task, None, targets, prev), temperature)
    return first_sentence(out)


def rate_sentence(pre_context, sentence, characters, include_relationship=False):
    '''-> {"<name>": 0-100, ..., "relationship": 0-100 or None}'''
    if mock_enabled():
        r = {c: random.randint(0, 100) for c in characters}
        r['relationship'] = random.randint(0, 100) if include_relationship else None
        return r
    keys = list(characters) + (['relationship'] if include_relationship else [])
    prompt = ('%s\n%s\n\nStory context:\n%s\n\nSentence to rate:\n%s\n\n'
              'Rate this sentence for each of these keys: %s. Each value is an integer 0-100. '
              'Answer with a JSON object only, e.g. {%s}.'
              % (FORTUNE_DEF, RELATIONSHIP_DEF, pre_context or '(none)', sentence, json.dumps(keys),
                 ', '.join('"%s": 50' % k for k in keys)))
    data = parse_json(_chat(_rater_model(), prompt, 0, json_mode=True))
    out = {}
    for k in keys:
        try:
            out[k] = clamp(round(float(data[k])))
        except (KeyError, TypeError, ValueError):
            out[k] = 50  # model skipped/garbled this key: neutral rather than failing the request
    out.setdefault('relationship', None)
    return out


def _distance(rating, targets):
    ds = [abs(rating[k] - v) for k, v in targets.items() if v is not None and v >= 0 and rating.get(k) is not None]
    return sum(ds) / len(ds) if ds else 0


def best_of_n(generate, rate, targets, regeneration=1):
    '''Generate, rate, keep the closest candidate; stop under DIFF_THRESHOLD or after the attempt cap.
    generate() -> sentence, rate(sentence) -> ratings dict. Returns (sentence, ratings).'''
    attempts = max(1, min(MAX_ATTEMPTS, round(regeneration) + 1))
    best = None
    for _ in range(attempts):
        s = generate()
        if not s:
            continue
        r = rate(s)
        d = _distance(r, targets)
        if best is None or d < best[0]:
            best = (d, s, r)
        if d < DIFF_THRESHOLD:
            break
    if best is None:
        raise ValueError('Model returned no text')
    return best[1], best[2]


def _mock_sentence(targets):
    names = [k for k in targets if k != 'relationship'] or ['Someone']
    return '%s walked on, and %s.' % (names[0], random.choice(
        ['things looked up', 'the day got worse', 'nothing much happened', 'a new friend appeared']))

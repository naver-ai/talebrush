--------------------------------------------------------------------------------

Code for TaleBrush.

[Paper link](https://johnr0.github.io/assets/publications/CHI2022-TaleBrush.pdf)
[Video link](https://youtu.be/F_y6drm6af8)
[Project website link](https://johnr0.github.io/publications/TaleBrush_CHI2022/)

> **This is a modified fork** of [naver-ai/TaleBrush](https://github.com/naver-ai/talebrush) (CHI 2022), distributed under GPL-3.0 (see `LICENSE` and `NOTICE`). The local GPT-Neo/GeDi model server was removed; sentence generation and rating now use prompt-engineered calls to an OpenAI-compatible LLM API (OpenAI or OpenRouter). Each of up to 2 characters has its own fortune layer, and a relationship canvas tracks the score between them.

Partially forked from [GeDi](https://arxiv.org/abs/2009.06367) and [Flask React Boilerplate](https://travis-ci.org/YaleDHLab/flask-react-boilerplate).

# Introduction

TaleBrush uses a line sketching interaction for intuitive control and sensemaking of story generation with language models.
TaleBrush allows users to control a character's fortune (and, with two characters, their relationship).

# Local setup

Requires Python 3 and Node.js.

```bash
cd TaleBrush_Interface
pip install -r requirements.txt
cp .env.example .env        # then edit .env (see below)
npm install
NODE_OPTIONS=--openssl-legacy-provider npm run build   # the option is only needed on Node 17+
npm run serve               # http://localhost:7082/talebrush
```

For frontend development with hot reload run `npm start` (port 7081) next to the Flask server; note the dev server has no `/api` proxy, so `npm run serve` after a build is the simplest way to run the whole app.

## Environment variables (`.env`)

| Variable | Meaning |
| --- | --- |
| `LLM_BASE_URL` | Default `https://api.openai.com/v1`. For OpenRouter use `https://openrouter.ai/api/v1`. |
| `LLM_API_KEY` | Provider key. Never logged. |
| `LLM_MODEL` | Model used to write sentences. |
| `LLM_RATER_MODEL` | Optional model for rating sentences; defaults to `LLM_MODEL`. |
| `LLM_MOCK=1` | Fake sentences and random ratings, no network or key needed. |

## Tests

```bash
cd TaleBrush_Interface && python -m pytest server/tests
```

## Citation
```
@inproceedings{10.1145/3491102.3501819,
author = {Chung, John Joon Young and Kim, Wooseok and Yoo, Kang Min and Lee, Hwaran and Adar, Eytan and Chang, Minsuk},
title = {TaleBrush: Sketching Stories with Generative Pretrained Language Models},
year = {2022},
isbn = {9781450391573},
publisher = {Association for Computing Machinery},
address = {New York, NY, USA},
url = {https://doi.org/10.1145/3491102.3501819},
doi = {10.1145/3491102.3501819},
abstract = {While advanced text generation algorithms (e.g., GPT-3) have enabled writers to co-create stories with an AI, guiding the narrative remains a challenge. Existing systems often leverage simple turn-taking between the writer and the AI in story development. However, writers remain unsupported in intuitively understanding the AI’s actions or steering the iterative generation. We introduce TaleBrush, a generative story ideation tool that uses line sketching interactions with a GPT-based language model for control and sensemaking of a protagonist’s fortune in co-created stories. Our empirical evaluation found our pipeline reliably controls story generation while maintaining the novelty of generated sentences. In a user study with 14 participants with diverse writing experiences, we found participants successfully leveraged sketching to iteratively explore and write stories according to their intentions about the character’s fortune while taking inspiration from generated stories. We conclude with a reflection on how sketching interactions can facilitate the iterative human-AI co-creation process. },
booktitle = {CHI Conference on Human Factors in Computing Systems},
articleno = {209},
numpages = {19},
keywords = {story writing, controlled generation, creativity support tool, story generation, sketching},
location = {New Orleans, LA, USA},
series = {CHI '22}
}
```

## License
TaleBrush is licensed under [GPL3 LICENSE](LICENSE).

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

Requires Python 3 and Node.js. Run everything from `TaleBrush_Interface/`.

```bash
cd TaleBrush_Interface
pip install -r requirements.txt
cp .env.example .env        # copies the template; then edit .env (see below)
npm install
NODE_OPTIONS=--openssl-legacy-provider npm run build   # the option is only needed on Node 17+
npm run serve
```

Open **http://localhost:7082/talebrush** (`/` alone returns 404; that is expected).

**Next time:** just `npm run serve`. Rebuild (`npm run build`) only after changing files in `src/`, and restart the server after editing `.env`.

For frontend development with hot reload, `npm start` (port 7081) has no `/api` proxy, so building and running `npm run serve` is the simplest way to run the whole app.

## Environment variables (`.env`)

`.env` holds your key and is git-ignored. Example for OpenAI:

```
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini
LLM_MOCK=0
```

For OpenRouter use `LLM_BASE_URL=https://openrouter.ai/api/v1` and a `provider/model` name such as `openai/gpt-4o-mini`. Values take no quotes.

| Variable | Meaning |
| --- | --- |
| `LLM_BASE_URL` | Default `https://api.openai.com/v1`. |
| `LLM_API_KEY` | Provider key. Never logged. |
| `LLM_MODEL` | Model that writes sentences. |
| `LLM_RATER_MODEL` | Optional model that rates sentences (0-100 per character); defaults to `LLM_MODEL`. A cheaper model works here. |
| `LLM_MOCK=1` | Fake sentences and random ratings, no network or key needed. Good for trying the UI; the rated lines will not follow your drawing. |

## Using the tool

1. Write sentences in the text box, one per line, each starting with `>`. Click outside the box so they are parsed.
2. Name your character(s) in the chips above the canvas. `+` adds a second character (max 2), `×` removes one (with confirmation).
3. Each character has its own colour layer. Click a chip to make that character active: only the active layer is drawn on and erased (pen and eraser at the bottom), the other is shown faded.
4. Draw a line to the **right of your existing sentences**. The x-axis is the sentence position. Columns you draw on get generated; sentences outside the stroke are used as context. Drawing over all your sentences gives "No context is given". Sentences on both sides of a stroke are infilled.
5. With two characters, tick **Relationship in separate panel** for a smaller canvas below (0 = hostile, 100 = close). Where it has a value it is a generation target too, otherwise the relationship is left free. Hiding the panel or removing a character keeps its data; **clear** wipes it.
6. Hard-drawn (slow) strokes retry more; the optional surprise panel sets the sampling temperature.

## Tests

```bash
cd TaleBrush_Interface && python -m pytest server/tests
```

## Troubleshooting

- **Blank page:** run the build step first (`build/` is missing).
- **Error alert when generating:** bad key, wrong model name or provider outage. The message comes from the provider. Set `LLM_MOCK=1` to check the app itself.
- **Strokes drawn away from the pointer:** fixed in the current code (viewport coordinates); rebuild and hard-refresh.

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

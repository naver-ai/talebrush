
--------------------------------------------------------------------------------

ML backend code for TaleBrush.

[Paper link](https://johnr0.github.io/assets/publications/CHI2022-TaleBrush.pdf)
[Video link](https://youtu.be/F_y6drm6af8)

Forked from [GeDi: Generative Discriminator Guided Sequence Generation](https://arxiv.org/abs/2009.06367)

# Introduction

TaleBrush uses a line sketching interaction for intuitive control and sensemaking of story generation with GPT-based language models.
TaleBrush allows uses to control the protagonist's fortune. 

To run the code on colab, [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/naver-ai/TaleBrush/blob/main/TaleBrush_Backend/server_code.ipynb]

To run it locally, 

First, download prompt embeddings for story generation ([continuation](https://drive.google.com/file/d/1uHDpHpi95MNxQFE4sDQYcFKO3FYTLN-9/view?usp=sharing), [infilling from front](https://drive.google.com/file/d/1h5XMqEhBXOBv11gko25z1pn1O-MTl9zc/view?usp=sharing), and [infilling from back](https://drive.google.com/file/d/1r_8wNM8v45HJ6xnTMwQf7F4FKlYk86y0/view?usp=sharing)) and [fortune recognition](https://drive.google.com/file/d/1QqTS5PAV6i5iZAN8rlg9UQvjIgOxTYKd/view?usp=sharing).
Also, download [the trained GeDi model](https://drive.google.com/file/d/1rQn9uDlKPHi5dbzhCLGpYld5c2NM1L9i/view?usp=sharing).

Second, unzip these in the folder. 

Third, install dependencies (`pip install -r requirements.txt`).

Then, run the server code (`python server_code.py`). 

To connect it to the front-end server, you need to replace [PLACEHOLDER] in TaleBrush_Interface/server/app.py with your ML server url. 

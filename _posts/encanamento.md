---
layout: post
title: Encanamento
category: Esquinas
syndicate_to:
  - bluesky
  - mastodon
tags:
  - web
  - desenvolvimento
date: '2026-03-05 22:33:00 -0300'
---

Tava lendo esse [artigo no _Unsung_ sobre a estrutura de URLs do Flickr](https://unsung.aresluna.org/unsung-heroes-flickrs-urls-scheme/), e [essa continuação com links sobre "design de URLs"](https://unsung.aresluna.org/mailbag-urls-as-ui/).

Eu acho muito bonita a forma com que o Flickr, o Last.FM e o Letterboxd trabalham suas URLs. Eu gosto de digitar os endereços dos sites que eu visito --- foi assim que eu aprendi a navegar na internet ---, e esses sites permitem que a gente descubra as coisas mais bacanas misturando e explorando suas URLs. O que acontece se eu trocar uma geotag no Flickr, ou misturar os gêneros no Last.FM, ou até mesmo filtrar os filmes que meu amigo assistiu por país? Eu posso fazer toda essa descoberta só observando e trocando caminhos.

Enquanto eu tava redesenhando o meu site eu tava pensando nessa estrutura de URLs, e como eu queria possibilitar esse tipo de descoberta. Com o tempo, eu espero que esse site vire uma verdadeira "floresta" em que eu possa me perder em tags e links por aí. Pra isso, eu preciso reorganizar essas tags, criar um jardim, etc.

Mas uma dessas tarefas foi pensar em uma estrutura de URLs, e tendo lido recentemente o texto no _Unsung_ eu me peguei reestruturando as URLs do site pra começar a possibilitar esse tipo de descoberta.

Por regra geral, os posts agora estão organizados assim:

```
/categoria/ano/mês/dia/nome-do-post/
```

As tags são fáceis:

```
/tags/nome-da-tag/
```

Uma hora eu quero fazer o `/tags/` ser um mapa gráfico das relações entre as tags aqui do site.

Se você acessa uma página de categora (ex. `/notas/`), você vê o arquivo daquela categoria. Anos, meses e dias também podem ser misturados para navegar por aquivos. Pra acessar os posts de dezembro, você pode navegar pra `arthr.me/2025/12/`, e assim por diante.

Eu gosto como fazer esses esquemas de URL, integrar com outros serviços e ver se tudo funciona de uma ponta à outra é como mexer no [encamanento do site](https://inessential.com/2013/03/14/why_i_love_rss_and_you_do_too.html). E meu site é como minha casa. Até mexer no encanamento e saber que tá tudo bem é uma alegria.

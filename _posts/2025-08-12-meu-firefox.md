---
layout: post
title: 'Meu Firefox'
date: '2025-08-12T11:19:00-03:00'
tags:
- apps
- Firefox
- web
tumblr_url: https://arthrfrts.tumblr.com/post/798569014936928256/meu-firefox
category: Notas
---
Depois de mais de uma década usando o Safari como meu navegador principal, eu voltei pro Firefox.

Desde que eu mudei para o Mac em 2010 com meu primeiro MacBook, eu me afeiçoei à simplicidade e velocidade do Safari. Eu também gosto como o WebKit implementa certos recursos de CSS. Antes disso, eu era um usuário ferrenho do Firefox desde ser deixado para trás pelo Opera depois de eles deixarem de usar o [Presto](https://en.wikipedia.org/wiki/Presto_(browser_engine)) na versão 12 (longa história).

Eu nunca deixei de usar o Firefox completamente. Meus computadores do trabalho geralmente são Windows (as vezes, Linux), e neles eu sempre preferi o Firefox. Desde que o Firefox [reescreveu uma boa parte da sua arquitetura em Rust](https://blog.mozilla.org/en/mozilla/introducing-firefox-quantum/) ele ficou imbatível pros meus usos no Windows. A trajetória nem sempre é boa — a Mozilla é péssima nos negócios (Lockwise, Pocket 💔) e tirou recursos que eu usava com frequência, como o leitor de RSS embutido — mas muito do que faz o Firefox ser bom é uma constante: o Gecko é poderosíssimo, e as ferramentas para desenvolvedores são ótimas. Foi basicamente no inspetor que eu aprendi a usar a implementação de grids do CSS, por exemplo. A biblioteca de extensões também é a melhor que tem.

O Safari vem me perdendo há uma boa parte desses últimos anos, mas a cartada final foi o Liquid Glass, que tira mais espaço da janela do navegador, mesmo que a interface seja toda feita com o “vidro” que a Apple vai implementar nos OS 26. O Safari vem pecando há anos com a retirada de recursos (isso parece ser comum em navegadores ultimamente?).

O que me fez migrar de vez mesmo foi algo muito mais simples: a barra lateral. A gente não vive mais num mundo em que monitores 4:3 são a ordem do dia, e a necessidade de ficar atulhando a interface com abas que diminuem o eixo vertical (o menor em monitores 16:9!) tava me deixando maluco.

O Safari tem uma barra lateral mas é repleta de bugs (o foco da aba ativa não é consistente!) e muito mal utilizada. Eu não posso colocar botões ali, como eu posso botar na barra superior. Já o Firefox introduziu a barra lateral como beta há um tempo, mas no último mes ela veio para o canal estável e é tudo o que eu precisava. Extensões podem colocar painéis na barra lateral (funciona muito bem com o Side View e com o Notes), e eu posso botar ela em lados distintos (eu gosto da barra lateral abaixo dos botões de controle da janela — à direita no Windows e à esquerda no macOS).

Tem outros recursos que eu prefiro a implementação no Firefox: a ideia de _containers_ ao invés de _perfis_, como o Chrome/Edge e Safari implementaram. Eu não preciso de uma janela nova para abrir a conta de email do trabalho, por exemplo — eu posso só abrir uma nova aba no container “Trabalho”. A aba recebe uma decoração diferente e eu sei que ali é um outro contexto. Eu tenho containers que isolam e-commerce também, o que evita “sugestões” de compra me perseguindo pela internet se eu procuro por uma capinha pro meu Switch. Ela fica isolada naquele container.

Meu Firefox é mais ou menos assim (no Windows):

![](https://64.media.tumblr.com/4aa4d2a9abd82d64abd0c991b9c1d086/e09f6f195f655602-fa/s640x960/7ed35c36cc88060facebb8f6a916384e44ef9610.png)

E a minha seleção de extensões é essa:

- **[Favoritos do iCloud](https://addons.mozilla.org/pt-BR/firefox/addon/icloud-bookmarks/)** e **[Senhas do iCloud](https://addons.mozilla.org/pt-BR/firefox/addon/icloud-passwords/)**: depois que a Mozilla descontinuou o Lockwise, eu migrei pro chaveiro integrado do macOS e do iOS e ele é bom o suficiente pra mim. Eu ainda não uso o Firefox no celular, então os favoritos integrados do iCloud me ajudam a manter tudo integrado.
- **[Firefox Multi-Account Containers](https://addons.mozilla.org/pt-BR/firefox/addon/multi-account-containers/)**: eu não sei os motivos da Mozilla não ter implementado os containers como um recurso nativo do navegador. Enquanto isso não acontecer, a extensão é obrigatória pra mim, e _o melhor recurso_ do Firefox hoje.
- **[Indie Wiki Buddy](https://addons.mozilla.org/pt-BR/firefox/addon/indie-wiki-buddy/)**: me redireciona pra wikis de jogos melhores que as disponíveis no Fandom sempre que um link pra uma wiki do Fandom aparece pra mim. Como eu uso muito wikis de jogos como a do _Animal Crossing_ e de _Zelda_, e as buscas tendem a preferir as wikis hospedadas no Fandom (que não é um lugar legal na web), essa extensão é uma mão na roda.
- **[Livemarks](https://addons.mozilla.org/pt-BR/firefox/addon/livemarks/)**: recupera o recurso de leitor RSS direto na barra ou no menu de favoritos que a Mozilla tirou do Firefox há uns anos. Tem alguns feeds que eu não gosto de ter no NetNewsWire porque eu não leio eles ou porque atualizam frequentemente ou porque é um assunto muito específico que eu gosto só de ler as vezes — e pra _esses_ feeds é melhor eu ter acesso direto no navegador, onde eu posso dar uma olhada nas manchetes e clicar no que me interessar.
- **[Notes by Firefox](https://addons.mozilla.org/pt-BR/firefox/addon/notes-by-firefox/)**: outra extensão que devia se transformar em recurso integrado. Cria um painel de anotações que se tornou muito útil pra mim no dia-a-dia, principalmente quando quero anotar ideias de post (como essa aqui!) e se integra perfeitamente na barra lateral.
- **[Nook](https://addons.mozilla.org/pt-BR/firefox/addon/nook/)**: essa extensão tá só pela hora da morte, faz um tempo que não é atualizada, mas ela faz uma coisa muito bem — toca a música horária dos jogos _Animal Crossing_, que eu acho a trilha perfeita pra trabalhar. Eu queria uma assim pra trilha-sonora do _The Sims_ original também.
- **[Save to GoodLinks](https://addons.mozilla.org/pt-BR/firefox/addon/save-to-goodlinks/)**: depois da morte do Pocket, eu migrei minhas leituras pro [GoodLinks](https://goodlinks.app/). Como ele é só pra sistemas operacionais da Apple, eu uso a extensão pra salvar páginas quando estou navegando no Windows também.
- **[Side View](https://addons.mozilla.org/pt-BR/firefox/addon/side-view/)**: acho que essa extensão foi inspirada num recurso do finado Arc Browser que permitia você ter duas abas abertas na mesma janela ao mesmo tempo. Eu gosto da implementação do Firefox pra isso e eu uso um bocado. Acho que vai ser integrado como recurso nativo em breve.
- **[uBlock Origin](https://addons.mozilla.org/pt-BR/firefox/addon/ublock-origin/)**: o original. Ainda é imbatível.
- **[Web Archives](https://addons.mozilla.org/pt-BR/firefox/addon/view-page-archive/)**: me ajuda a arquivar páginas que eu quero preservar no Web Archive e em outros sites de arquivamento digital. É ótimo e uma mão na roda para enfrentar paywalls.

Depois de voltar pro Thunderbird como meu app de email e calendário padrão em todos os meus computadores, é bom estar 100% de volta ao Firefox depois de tanto tempo também. Tomara que as coisas melhorem pra esse navegador.


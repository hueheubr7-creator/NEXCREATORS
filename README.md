# NEX — site institucional

Site de página única da NEX Serviços Comerciais, estúdio de serviços digitais
para empresas e comércios: sites e landing pages, vídeos, materiais comerciais
e artes para redes sociais.

O objetivo único do site é levar o visitante a pedir orçamento pelo WhatsApp.

## Stack

HTML, CSS e JavaScript puros — sem build, sem dependências. Os arquivos são
servidos exatamente como estão no repositório.

```
index.html    estrutura e conteúdo (todas as seções)
styles.css    identidade visual e responsividade
script.js     fade-in ao rolar, menu mobile e filtro do portfólio
```

## Seções

Hero · 01 Serviços · 02 Sites e Landing Pages · 03 Vídeos · 04 Materiais
Comerciais · 05 Artes e Posts · 06 Portfólio · 07 Como funciona · 08 Sobre a NEX
· Chamada final.

As quatro seções de serviço seguem o mesmo molde: promessa, para quem é,
destaque, o que está incluído, tipos de entrega, exemplos, como funciona e prazo,
perguntas frequentes e botão de orçamento.

## WhatsApp

Todos os botões de orçamento são links `wa.me` escritos direto no HTML (funcionam
sem JavaScript), com mensagem pré-preenchida:

- Geral: "Olá! Vim pelo site da NEX e quero um orçamento."
- Cada serviço cita o próprio serviço, por exemplo
  "… quero um orçamento de site / landing page."

Para trocar o número, substitua `5517981428839` em todo o `index.html`.

## Placeholders

Conteúdo que depende de material real está marcado com `[PLACEHOLDER: ...]` e
aparece na página com borda tracejada. Busque por `PLACEHOLDER` no `index.html`.

## Identidade

- Branco `#FFFFFF` como fundo dominante, preto `#080A0D` para texto e traços.
- Tipografia: Space Grotesk (títulos e números) e Inter (texto corrido).
- O símbolo NX é um SVG definido uma única vez em `index.html` (`#nx-mark`) e
  reaproveitado no header, no hero, nas marcas d'água, no rodapé e no favicon.

## Rodar localmente

```bash
python -m http.server 8321
```

Depois abra `http://localhost:8321`.

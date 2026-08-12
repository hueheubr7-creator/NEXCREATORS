# NEX Creators — site institucional

Site institucional de página única da NEX Creators, rede profissional de
influenciadores com atuação especializada no mercado de iGaming.

## Stack

HTML, CSS e JavaScript puros — sem build, sem dependências. Os arquivos são
servidos exatamente como estão no repositório.

```
index.html    estrutura e conteúdo
styles.css    identidade visual e responsividade
script.js     fade-in ao rolar, menu mobile e envio do formulário
```

## Identidade

- Branco `#FFFFFF` como fundo dominante, preto `#080A0D` para texto e traços.
- Tipografia: Space Grotesk (títulos e números) e Inter (texto corrido).
- O símbolo NX é um SVG definido uma única vez em `index.html` (`#nx-mark`) e
  reaproveitado no header, no hero, na marca d'água, no rodapé e no favicon.

## Rodar localmente

Qualquer servidor estático serve. Com Python:

```bash
python -m http.server 8321
```

Depois abra `http://localhost:8321`.

## Contato

Todos os CTAs e o formulário apontam para o WhatsApp oficial:
`https://wa.me/5517981428839`. O formulário não usa backend — ele monta a
mensagem e abre a conversa no WhatsApp.

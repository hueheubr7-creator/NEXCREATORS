/* NEX — interações discretas */

(function () {
  "use strict";

  /* Fade-in ao rolar */
  const revealed = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealed.forEach((el) => io.observe(el));
  } else {
    revealed.forEach((el) => el.classList.add("visible"));
  }

  /* Menu mobile */
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* Portfólio: filtro por serviço */
  const filtros = document.querySelectorAll(".filtro");
  const trabalhos = document.querySelectorAll(".trabalho");

  function filtrar(servico) {
    filtros.forEach((botao) =>
      botao.setAttribute("aria-pressed", String(botao.dataset.filtro === servico))
    );
    trabalhos.forEach((item) => {
      item.hidden = servico !== "todos" && item.dataset.servico !== servico;
    });
  }

  filtros.forEach((botao) =>
    botao.addEventListener("click", () => filtrar(botao.dataset.filtro))
  );

  /* Links "Ver no portfólio" de cada serviço já abrem o filtro certo */
  document.querySelectorAll("a[data-filtro]").forEach((link) =>
    link.addEventListener("click", () => filtrar(link.dataset.filtro))
  );
})();

/* ================================================================
   Hero: lâmina branca inclinada que sobe ao rolar, e distorção líquida
   da imagem seguindo o mouse (WebGL, sem bibliotecas)
   ================================================================ */
(function () {
  "use strict";

  const hero = document.querySelector(".hero");
  if (!hero) return;

  const nav = document.querySelector(".nav");
  const menu = document.getElementById("navLinks");
  const toggle = document.getElementById("navToggle");
  const lamina = document.querySelector(".lamina");
  const canvas = hero.querySelector(".hero__canvas");
  const reduzMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouseFino = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Rolagem: parallax do hero, lâmina e cor do menu ---------- */

  const PARALLAX = 0.1;           // o hero sobe 10% da rolagem
  const LAMINA_SUBIDA = 0.26;     // a lâmina sobe até 26% da altura da tela
  const LAMINA_INCLINACAO = 0.13; // tangente máxima da inclinação (≈ 7,4°)

  let progresso = 0;
  let quadroPedido = false;
  let heroVisivel = true;

  function aplicarRolagem() {
    quadroPedido = false;
    const vh = window.innerHeight;
    const y = window.scrollY;
    const alvo = Math.min(Math.max(y / vh, 0), 1);

    // Suavização: a lâmina persegue a rolagem, em vez de colar nela
    progresso = reduzMovimento ? alvo : progresso + (alvo - progresso) * 0.14;
    if (Math.abs(alvo - progresso) < 0.0005) progresso = alvo;

    if (!reduzMovimento) {
      const desloc = -PARALLAX * Math.min(y, vh * 1.2);
      hero.style.transform = `translate3d(0, ${desloc.toFixed(1)}px, 0)`;
    }

    let topoDireito = Infinity;
    if (lamina) {
      const p = reduzMovimento ? 0 : progresso;
      const sobe = -LAMINA_SUBIDA * vh * p;
      const tangente = -LAMINA_INCLINACAO * p;
      lamina.style.transform =
        `translate3d(0, ${sobe.toFixed(1)}px, 0) skewY(${Math.atan(tangente).toFixed(4)}rad)`;
      // Ponto mais alto da borda: o lado direito da tela
      const topoSecao = lamina.parentElement.getBoundingClientRect().top;
      topoDireito = topoSecao + sobe + tangente * (window.innerWidth / 2);
    }

    if (nav) {
      const menuAberto = menu && menu.classList.contains("open");
      nav.classList.toggle("nav--hero", topoDireito > nav.offsetHeight && !menuAberto);
    }

    heroVisivel = y < vh * 1.1;
    if (progresso !== alvo) pedirQuadro();
  }

  function pedirQuadro() {
    if (quadroPedido) return;
    quadroPedido = true;
    requestAnimationFrame(aplicarRolagem);
  }

  window.addEventListener("scroll", pedirQuadro, { passive: true });
  window.addEventListener("resize", pedirQuadro);
  if (toggle) toggle.addEventListener("click", pedirQuadro);
  if (menu) menu.addEventListener("click", () => setTimeout(pedirQuadro, 0));
  aplicarRolagem();

  /* ---------- Distorção líquida ---------- */

  if (!canvas) return;

  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  const FORCA = 0.24;      // deslocamento máximo, em fração da tela
  const DECAIMENTO = 0.035; // quanto o rastro some por quadro
  const OCIOSO_MS = 3000;   // sem mouse por esse tempo, a animação para

  /* Composição padrão (sem foto): fundo preto, brilho suave e o símbolo NX
     gigante recortado pela tela, com granulação para a distorção ter onde agir */
  function composicaoNX(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");

    ctx.fillStyle = "#080A0D";
    ctx.fillRect(0, 0, w, h);

    const brilho = ctx.createRadialGradient(w * 0.64, h * 0.4, 0, w * 0.64, h * 0.4, Math.max(w, h) * 0.75);
    brilho.addColorStop(0, "rgba(255,255,255,0.17)");
    brilho.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = brilho;
    ctx.fillRect(0, 0, w, h);

    const escala = (h * 1.08) / 400;
    ctx.save();
    ctx.translate(w * 0.3, h * -0.04);
    ctx.scale(escala, escala);
    ctx.beginPath();
    ctx.rect(0, 0, 660, 400);
    ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 27;
    ctx.lineJoin = "miter";
    ctx.miterLimit = 4;
    ctx.stroke(new Path2D("M-30 -14 342 288 342 -25 690 385"));
    ctx.stroke(new Path2D("M13.5 375 13.5 115 325 380 690 -7"));
    ctx.restore();

    const grao = document.createElement("canvas");
    grao.width = grao.height = 128;
    const g = grao.getContext("2d");
    const ruido = g.createImageData(128, 128);
    for (let i = 0; i < ruido.data.length; i += 4) {
      const v = Math.random() * 255;
      ruido.data[i] = ruido.data[i + 1] = ruido.data[i + 2] = v;
      ruido.data[i + 3] = 14;
    }
    g.putImageData(ruido, 0, 0);
    ctx.fillStyle = ctx.createPattern(grao, "repeat");
    ctx.fillRect(0, 0, w, h);
    return c;
  }

  /* Foto grande demais para a GPU é reduzida antes de virar textura */
  function limitar(img, max) {
    const maior = Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height);
    if (maior <= max) return img;
    const k = max / maior;
    const c = document.createElement("canvas");
    c.width = Math.round((img.naturalWidth || img.width) * k);
    c.height = Math.round((img.naturalHeight || img.height) * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return c;
  }

  function carregarImagem(src) {
    return new Promise((ok, falha) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => ok(img);
      img.onerror = falha;
      img.src = src;
    });
  }

  const srcFoto = (hero.dataset.imagem || "").trim();
  let foto = null; // imagem da foto, se houver; senão usa a composição

  function tamanhoTela() {
    return {
      w: Math.max(1, Math.round(hero.clientWidth * DPR)),
      h: Math.max(1, Math.round(hero.clientHeight * DPR)),
    };
  }

  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false });

  /* Sem WebGL: mostra a imagem parada em preto e branco */
  if (!gl) {
    const ctx = canvas.getContext("2d");
    const pintar2D = () => {
      const { w, h } = tamanhoTela();
      canvas.width = w;
      canvas.height = h;
      const fonte = foto || composicaoNX(w, h);
      const fw = fonte.naturalWidth || fonte.width;
      const fh = fonte.naturalHeight || fonte.height;
      const k = Math.max(w / fw, h / fh);
      ctx.filter = "grayscale(1)";
      ctx.drawImage(fonte, (w - fw * k) / 2, (h - fh * k) / 2, fw * k, fh * k);
    };
    (srcFoto ? carregarImagem(srcFoto).then((i) => (foto = i)).catch(() => {}) : Promise.resolve())
      .then(pintar2D);
    window.addEventListener("resize", pintar2D);
    return;
  }

  const VERT = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main() {
      v_uv = a_pos * 0.5 + 0.5;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }`;

  /* Desloca a imagem pelo mapa de rastro (rg = velocidade do mouse), soma uma
     ondulação proporcional à força e converte para preto e branco */
  const FRAG = `
    precision mediump float;
    uniform sampler2D u_img;
    uniform sampler2D u_mapa;
    uniform vec2 u_res;
    uniform vec2 u_imgRes;
    uniform float u_tempo;
    uniform float u_forca;
    varying vec2 v_uv;

    vec2 cobrir(vec2 uv) {
      float k = max(u_res.x / u_imgRes.x, u_res.y / u_imgRes.y);
      vec2 tam = u_imgRes * k;
      return (uv * u_res - (u_res - tam) * 0.5) / tam;
    }

    void main() {
      vec2 d = texture2D(u_mapa, v_uv).rg - 0.5;
      /* zona morta: o mapa de 8 bits nunca volta exatamente ao neutro */
      d = sign(d) * max(abs(d) - 0.06, 0.0) / 0.44 * 0.5;
      float m = length(d);
      vec2 onda = vec2(sin(v_uv.y * 26.0 + u_tempo * 1.7), cos(v_uv.x * 22.0 - u_tempo * 1.4)) * m * 0.05;
      vec2 uv = v_uv - d * u_forca - onda;
      vec3 cor = texture2D(u_img, cobrir(uv)).rgb;
      float cinza = dot(cor, vec3(0.299, 0.587, 0.114));
      gl_FragColor = vec4(vec3(cinza), 1.0);
    }`;

  function shader(tipo, fonte) {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, fonte);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  const programa = gl.createProgram();
  gl.attachShader(programa, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(programa, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(programa);
  gl.useProgram(programa);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(programa, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = (nome) => gl.getUniformLocation(programa, nome);
  const uRes = u("u_res");
  const uImgRes = u("u_imgRes");
  const uTempo = u("u_tempo");
  gl.uniform1i(u("u_img"), 0);
  gl.uniform1i(u("u_mapa"), 1);
  gl.uniform1f(u("u_forca"), reduzMovimento || !mouseFino ? 0 : FORCA);

  function novaTextura(unidade) {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unidade);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const texImg = novaTextura(0);
  const texMapa = novaTextura(1);

  /* Mapa do rastro: pequeno, cinza neutro = sem deslocamento */
  const mapa = document.createElement("canvas");
  const mctx = mapa.getContext("2d");

  function limparMapa() {
    mctx.globalAlpha = 1;
    mctx.fillStyle = "rgb(128,128,128)";
    mctx.fillRect(0, 0, mapa.width, mapa.height);
  }

  function enviarImagem() {
    const { w, h } = tamanhoTela();
    const fonte = foto ? limitar(foto, gl.getParameter(gl.MAX_TEXTURE_SIZE)) : composicaoNX(w, h);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texImg);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fonte);
    gl.uniform2f(uImgRes, fonte.naturalWidth || fonte.width, fonte.naturalHeight || fonte.height);
  }

  function dimensionar() {
    const { w, h } = tamanhoTela();
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
    mapa.width = 256;
    mapa.height = Math.max(64, Math.round((256 * h) / w));
    limparMapa();
    enviarImagem();
  }

  function desenhar(t) {
    mctx.globalAlpha = 1;
    mctx.fillStyle = `rgba(128,128,128,${DECAIMENTO})`;
    mctx.fillRect(0, 0, mapa.width, mapa.height);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texMapa);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mapa);
    gl.uniform1f(uTempo, t / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /* Pinta o rastro entre a posição anterior e a atual, com a velocidade
     do movimento codificada nos canais vermelho (x) e verde (y) */
  function pintarRastro(x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.01) return;
    const raio = mapa.width * 0.11;
    const escala = mapa.width * 0.04;
    const vx = Math.max(-1, Math.min(1, dx / escala));
    const vy = Math.max(-1, Math.min(1, -dy / escala)); // y da textura cresce para cima
    const r = Math.round(128 + vx * 120);
    const g = Math.round(128 + vy * 120);
    const passos = Math.max(1, Math.ceil(dist / (raio * 0.25)));
    for (let i = 1; i <= passos; i++) {
      const px = x0 + (dx * i) / passos;
      const py = y0 + (dy * i) / passos;
      const grad = mctx.createRadialGradient(px, py, 0, px, py, raio);
      grad.addColorStop(0, `rgba(${r},${g},128,0.9)`);
      grad.addColorStop(1, `rgba(${r},${g},128,0)`);
      mctx.fillStyle = grad;
      mctx.fillRect(px - raio, py - raio, raio * 2, raio * 2);
    }
  }

  let rodando = false;
  let ultimoMovimento = 0;

  function quadro(t) {
    if (!heroVisivel) {
      rodando = false;
      return;
    }
    desenhar(t);
    if (performance.now() - ultimoMovimento < OCIOSO_MS) {
      requestAnimationFrame(quadro);
    } else {
      limparMapa();
      desenhar(t);
      rodando = false;
    }
  }

  function animar() {
    if (rodando) return;
    rodando = true;
    requestAnimationFrame(quadro);
  }

  let mouse = null;
  if (mouseFino && !reduzMovimento) {
    hero.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * mapa.width;
      const y = ((e.clientY - r.top) / r.height) * mapa.height;
      if (mouse) pintarRastro(mouse.x, mouse.y, x, y);
      mouse = { x, y };
      ultimoMovimento = performance.now();
      animar();
    });
    hero.addEventListener("pointerleave", () => (mouse = null));
  }

  let timerResize = 0;
  window.addEventListener("resize", () => {
    clearTimeout(timerResize);
    timerResize = setTimeout(() => {
      dimensionar();
      desenhar(performance.now());
    }, 150);
  });

  dimensionar();
  desenhar(0);

  if (srcFoto) {
    carregarImagem(srcFoto)
      .then((img) => {
        foto = img;
        enviarImagem();
        desenhar(performance.now());
      })
      .catch(() => {}); // foto inválida: mantém a composição NX
  }
})();

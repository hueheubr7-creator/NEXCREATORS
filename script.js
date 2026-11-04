/* NEX — interações
   Um laço de quadros único cuida de tudo o que acompanha a rolagem e o mouse. */

(function () {
  "use strict";

  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
  const limitar = (v, min, max) => Math.min(Math.max(v, min), max);
  const lerp = (a, b, t) => a + (b - a) * t;

  const reduzMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouseFino = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const navH = () => $(".topo").offsetHeight;

  /* ---------- Rolagem suave (Lenis), se a biblioteca carregou ---------- */

  let lenis = null;
  if (window.Lenis && !reduzMovimento) {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
  }

  function rolarPara(alvo) {
    const destino = alvo === "#inicio" ? 0 : $(alvo);
    if (destino === null) return false;
    if (lenis) {
      lenis.scrollTo(destino, { offset: destino === 0 ? 0 : -navH() + 1 });
    } else {
      const y = destino === 0 ? 0 : destino.getBoundingClientRect().top + window.scrollY - navH() + 1;
      window.scrollTo({ top: y, behavior: reduzMovimento ? "auto" : "smooth" });
    }
    return true;
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute("href");
    if (href.length < 2) return; // "#" vazio (placeholder do Instagram)
    if (rolarPara(href)) {
      e.preventDefault();
      fecharMenu();
    }
  });

  /* ---------- Menu em tela cheia ---------- */

  const botaoMenu = $("#botaoMenu");
  const menuTela = $("#menuTela");
  $$(".menu-tela__nav a").forEach((a, i) => a.style.setProperty("--n", i));

  function abrirMenu() {
    menuTela.hidden = false;
    requestAnimationFrame(() => menuTela.classList.add("aberto"));
    botaoMenu.setAttribute("aria-expanded", "true");
    botaoMenu.setAttribute("aria-label", "Fechar menu");
    if (lenis) lenis.stop();
  }

  function fecharMenu() {
    if (!menuTela || menuTela.hidden) return;
    menuTela.classList.remove("aberto");
    menuTela.hidden = true;
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.setAttribute("aria-label", "Abrir menu");
    if (lenis) lenis.start();
  }

  if (botaoMenu && menuTela) {
    botaoMenu.addEventListener("click", () => (menuTela.hidden ? abrirMenu() : fecharMenu()));
    document.addEventListener("keydown", (e) => e.key === "Escape" && fecharMenu());
  }

  /* ---------- Entrada do hero ---------- */

  const hero = $(".hero");
  const comecar = () => hero && hero.classList.add("pronto");
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() =>
    requestAnimationFrame(comecar)
  );
  setTimeout(comecar, 1200); // garantia se as fontes demorarem

  /* Palavra que troca sozinha no hero */
  const itensGiro = $$(".giro__item");
  if (itensGiro.length > 1 && !reduzMovimento) {
    let atual = 0;
    setInterval(() => {
      const saindo = itensGiro[atual];
      atual = (atual + 1) % itensGiro.length;
      const entrando = itensGiro[atual];
      saindo.classList.remove("ativo");
      saindo.classList.add("saindo");
      entrando.classList.remove("saindo");
      entrando.classList.add("ativo");
      setTimeout(() => saindo.classList.remove("saindo"), 750);
    }, 1900);
  }

  /* ---------- Revelar ao rolar ---------- */

  const revelaveis = $$("[data-revelar], .final");
  if ("IntersectionObserver" in window && !reduzMovimento) {
    const io = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visivel");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revelaveis.forEach((el) => io.observe(el));
  } else {
    revelaveis.forEach((el) => el.classList.add("visivel"));
  }

  /* ---------- Manifesto: palavras acendem com a rolagem ---------- */

  const manifesto = $("[data-palavras]");
  let palavras = [];
  if (manifesto) {
    const texto = manifesto.textContent.trim().replace(/\s+/g, " ");
    manifesto.setAttribute("aria-label", texto);
    manifesto.innerHTML = texto
      .split(" ")
      .map((p) => `<span class="palavra" aria-hidden="true">${p}</span>`)
      .join(" ");
    palavras = $$(".palavra", manifesto);
  }

  /* ---------- Portfólio: filtros e prévia flutuante ---------- */

  const filtros = $$(".filtro");
  const obras = $$(".obra");

  function filtrar(servico) {
    filtros.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filtro === servico)));
    obras.forEach((o) => (o.hidden = servico !== "todos" && o.dataset.servico !== servico));
  }
  filtros.forEach((b) => b.addEventListener("click", () => filtrar(b.dataset.filtro)));
  $$("a[data-filtro]").forEach((a) => a.addEventListener("click", () => filtrar(a.dataset.filtro)));

  const previa = $(".previa");
  const posPrevia = { x: 0, y: 0, alvoX: 0, alvoY: 0 };
  if (previa && mouseFino) {
    obras.forEach((obra) => {
      obra.addEventListener("mouseenter", () => {
        const midia = $(".obra__midia", obra);
        previa.innerHTML = midia ? midia.outerHTML : "";
        previa.classList.add("ativa");
      });
      obra.addEventListener("mouseleave", () => previa.classList.remove("ativa"));
    });
  }

  /* ---------- Bento: brilho segue o mouse ---------- */

  if (mouseFino) {
    $$(".bloco-b").forEach((bloco) =>
      bloco.addEventListener("pointermove", (e) => {
        const r = bloco.getBoundingClientRect();
        bloco.style.setProperty("--mx", `${e.clientX - r.left}px`);
        bloco.style.setProperty("--my", `${e.clientY - r.top}px`);
      })
    );
  }

  /* ---------- Perguntas frequentes: abas e acordeão ---------- */

  const abas = $$(".aba");
  function ativarAba(aba, focar) {
    abas.forEach((a) => {
      const ativa = a === aba;
      a.setAttribute("aria-selected", String(ativa));
      a.tabIndex = ativa ? 0 : -1;
      $("#" + a.getAttribute("aria-controls")).hidden = !ativa;
    });
    if (focar) aba.focus();
  }
  abas.forEach((aba, i) => {
    aba.addEventListener("click", () => ativarAba(aba));
    aba.addEventListener("keydown", (e) => {
      const passo = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!passo) return;
      e.preventDefault();
      ativarAba(abas[(i + passo + abas.length) % abas.length], true);
    });
  });

  $$(".pergunta button").forEach((botao) =>
    botao.addEventListener("click", () => {
      const pergunta = botao.closest(".pergunta");
      const abrir = !pergunta.classList.contains("aberta");
      pergunta.classList.toggle("aberta", abrir);
      botao.setAttribute("aria-expanded", String(abrir));
    })
  );

  /* ---------- Cursor e botões magnéticos ---------- */

  const cursor = $(".cursor");
  const rato = { x: -100, y: -100, cx: -100, cy: -100 };

  if (mouseFino) {
    window.addEventListener("pointermove", (e) => {
      rato.x = e.clientX;
      rato.y = e.clientY;
      posPrevia.alvoX = e.clientX;
      posPrevia.alvoY = e.clientY;
      if (cursor) cursor.classList.remove("oculto");
    });
    document.addEventListener("mouseleave", () => cursor && cursor.classList.add("oculto"));
    document.addEventListener("pointerover", (e) => {
      const interativo = e.target.closest("a, button, .obra");
      if (cursor) cursor.classList.toggle("grande", !!interativo);
    });

    if (!reduzMovimento) {
      $$("[data-magnetico]").forEach((el) => {
        const forca = el.classList.contains("circulo") ? 0.35 : 0.22;
        el.addEventListener("pointermove", (e) => {
          const r = el.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          el.style.transform = `translate(${dx * forca}px, ${dy * forca}px)`;
        });
        el.addEventListener("pointerleave", () => {
          el.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
          el.style.transform = "";
          setTimeout(() => (el.style.transition = ""), 600);
        });
      });
    }
  }

  /* ---------- Laço de quadros: tudo que acompanha a rolagem ---------- */

  const progresso = $(".progresso");
  const secaoFinal = $(".final");
  const linhasHero = $$(".hero .linha");
  const trilho = $(".faixa__trilho");
  const grupoFaixa = $(".faixa__grupo");
  const cartoes = $$(".servico");
  const pilhaPresa = matchMedia("(min-width: 1081px) and (min-height: 760px)");
  const passos = $$(".passo");
  const linhaProcesso = $(".processo__linha span");
  const contador = $(".contador__atual span");
  const passosArea = $(".processo__passos");

  // A faixa precisa de duas cópias para dar a volta sem emenda
  if (trilho && grupoFaixa) trilho.appendChild(grupoFaixa.cloneNode(true));

  let ultimoY = window.scrollY;
  let faixaX = 0;
  let faixaDir = 1;
  let faixaInclina = 0;
  let passoAtual = -1;

  function quadro(tempo) {
    if (lenis) lenis.raf(tempo);

    const y = window.scrollY;
    const vh = window.innerHeight;
    const vel = y - ultimoY;
    ultimoY = y;

    // Barra de progresso da página
    const total = document.documentElement.scrollHeight - vh;
    if (progresso) progresso.style.transform = `scaleX(${total > 0 ? y / total : 0})`;

    // Menu escuro enquanto passa sobre a seção preta do fim
    if (secaoFinal) {
      const rf = secaoFinal.getBoundingClientRect();
      const h = navH();
      document.body.classList.toggle("topo-escuro", rf.top <= h && rf.bottom > h);
    }

    if (!reduzMovimento) {
      // Hero: linhas do título deslizam em direções alternadas
      if (y < vh * 1.2) {
        linhasHero.forEach((l) => {
          const dir = Number(l.dataset.dir || 1);
          l.style.transform = `translate3d(${dir * y * 0.12}px, 0, 0)`;
        });
      }

      // Faixa: corre sozinha, acelera e inclina com a velocidade da rolagem
      if (trilho && grupoFaixa) {
        if (vel !== 0) faixaDir = vel > 0 ? 1 : -1;
        const largura = grupoFaixa.offsetWidth;
        faixaX -= (0.6 + Math.min(Math.abs(vel), 60) * 0.35) * faixaDir;
        if (faixaX <= -largura) faixaX += largura;
        if (faixaX > 0) faixaX -= largura;
        faixaInclina = lerp(faixaInclina, limitar(vel * 0.25, -10, 10), 0.12);
        trilho.style.transform = `translate3d(${faixaX}px, 0, 0) skewX(${-faixaInclina}deg)`;
      }
    }

    // Manifesto: cada palavra acende conforme o texto atravessa a tela
    if (palavras.length) {
      const r = manifesto.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        const p = limitar((vh * 0.82 - r.top) / (r.height + vh * 0.25), 0, 1);
        const n = palavras.length;
        palavras.forEach((w, i) => (w.style.opacity = 0.14 + 0.86 * limitar(p * n - i, 0, 1)));
      }
    }

    // Serviços: o cartão de trás encolhe e escurece quando o próximo cobre
    if (pilhaPresa.matches && !reduzMovimento) {
      cartoes.forEach((c, i) => {
        const prox = cartoes[i + 1];
        if (!prox) return;
        const rc = c.getBoundingClientRect();
        const rp = prox.getBoundingClientRect();
        const p = limitar(1 - (rp.top - rc.top) / rc.height, 0, 1);
        c.style.transform = `scale(${1 - p * 0.06})`;
        c.style.setProperty("--escuro", (p * 0.45).toFixed(3));
      });
    } else if (cartoes.length && cartoes[0].style.transform) {
      cartoes.forEach((c) => {
        c.style.transform = "";
        c.style.setProperty("--escuro", 0);
      });
    }

    // Processo: linha que preenche e contador da etapa atual
    if (passosArea) {
      const r = passosArea.getBoundingClientRect();
      const p = limitar((vh * 0.55 - r.top) / r.height, 0, 1);
      if (linhaProcesso) linhaProcesso.style.setProperty("--p", p.toFixed(4));
      let idx = 0;
      passos.forEach((s, i) => {
        if (s.getBoundingClientRect().top < vh * 0.55) idx = i;
      });
      if (idx !== passoAtual) {
        passoAtual = idx;
        passos.forEach((s, i) => s.classList.toggle("atual", i <= idx));
        if (contador) {
          contador.style.transform = "translateY(-100%)";
          setTimeout(() => {
            contador.textContent = String(idx + 1).padStart(2, "0");
            contador.style.transition = "none";
            contador.style.transform = "translateY(100%)";
            requestAnimationFrame(() => {
              contador.style.transition = "";
              contador.style.transform = "";
            });
          }, reduzMovimento ? 0 : 280);
        }
      }
    }

    // Cursor e prévia seguem o mouse com atraso suave
    if (mouseFino) {
      rato.cx = lerp(rato.cx, rato.x, 0.22);
      rato.cy = lerp(rato.cy, rato.y, 0.22);
      if (cursor) cursor.style.transform = `translate3d(${rato.cx}px, ${rato.cy}px, 0)`;
      if (previa && previa.classList.contains("ativa")) {
        posPrevia.x = lerp(posPrevia.x, posPrevia.alvoX, 0.14);
        posPrevia.y = lerp(posPrevia.y, posPrevia.alvoY, 0.14);
        const inclina = limitar((posPrevia.alvoX - posPrevia.x) * 0.06, -8, 8);
        previa.style.transform =
          `translate3d(${posPrevia.x + 28}px, ${posPrevia.y - previa.offsetHeight / 2}px, 0) rotate(${inclina}deg)`;
      } else {
        posPrevia.x = posPrevia.alvoX;
        posPrevia.y = posPrevia.alvoY;
      }
    }

    requestAnimationFrame(quadro);
  }

  requestAnimationFrame(quadro);
})();

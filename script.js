/* NEX — interações
   Um laço de quadros único cuida de tudo o que acompanha a rolagem e o mouse. */

(function () {
  "use strict";

  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
  const limitar = (v, min, max) => Math.min(Math.max(v, min), max);
  const lerp = (a, b, t) => a + (b - a) * t;
  const dois = (n) => String(n).padStart(2, "0");

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
    if (!$(href) && href !== "#inicio") return;
    e.preventDefault();

    // No menu em tela cheia, deixa o "empurrão" da palavra aparecer antes de sair
    if (menuTela && menuTela.contains(link) && !reduzMovimento) {
      if (link.classList.contains("tocado")) return; // toque duplo: já está indo
      link.classList.add("tocado");
      setTimeout(() => {
        link.classList.remove("tocado");
        fecharMenu();
        rolarPara(href);
      }, 400);
      return;
    }

    rolarPara(href);
    fecharMenu();
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
  const fontesProntas = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontesProntas.then(() => requestAnimationFrame(comecar));
  setTimeout(comecar, 1200); // garantia se as fontes demorarem

  /* Palavra que troca sozinha no hero. A que saiu volta para baixo sem
     animação; senão ela atravessaria a caixa e se sobreporia à nova. */
  const itensGiro = $$(".giro__item");
  if (itensGiro.length > 1 && !reduzMovimento) {
    let atual = 0;
    setInterval(() => {
      const saindo = itensGiro[atual];
      atual = (atual + 1) % itensGiro.length;
      const entrando = itensGiro[atual];
      saindo.classList.remove("ativo");
      saindo.classList.add("saindo");
      entrando.classList.add("ativo");
      setTimeout(() => {
        saindo.style.transition = "none";
        saindo.classList.remove("saindo");
        void saindo.offsetWidth; // aplica a posição sem animar
        saindo.style.transition = "";
      }, 750);
    }, 1900);
  }

  /* ---------- Títulos de seção: palavras em máscaras ---------- */

  $$(".cabeca__titulo").forEach((titulo) => {
    const texto = titulo.textContent.trim().replace(/\s+/g, " ");
    titulo.setAttribute("aria-label", texto);
    titulo.innerHTML = texto
      .split(" ")
      .map((p, i) => `<span class="pm" aria-hidden="true"><span style="--d:${i}">${p}</span></span>`)
      .join(" ");
  });

  /* ---------- Faixas "Feito para": cópia para a volta sem emenda ---------- */

  const linhasTipos = $$(".tipos__linha");
  linhasTipos.forEach((linha) => {
    [...linha.children].forEach((item) => {
      const copia = item.cloneNode(true);
      copia.setAttribute("aria-hidden", "true");
      linha.appendChild(copia);
    });
  });

  /* Destaque que acompanha o centro: em cada faixa, a pílula mais perto do
     meio da tela acende e as vizinhas ficam meio acesas. Só calcula com as
     faixas visíveis. */
  const blocoTipos = $(".tipos");
  let tiposVisiveis = false;
  if (blocoTipos && "IntersectionObserver" in window) {
    new IntersectionObserver((e) => (tiposVisiveis = e[0].isIntersecting)).observe(blocoTipos);
  }

  function focarTipos() {
    const centro = window.innerWidth / 2;
    linhasTipos.forEach((linha) => {
      let foco = null;
      let menor = Infinity;
      const itens = [...linha.children];
      const distancias = itens.map((s) => {
        const r = s.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - centro);
        if (d < menor) {
          menor = d;
          foco = s;
        }
        return d;
      });
      itens.forEach((s, i) => {
        s.classList.toggle("foco", s === foco);
        s.classList.toggle("perto", s !== foco && distancias[i] < window.innerWidth * 0.28);
      });
    });
  }

  /* ---------- Revelar ao rolar ---------- */

  const revelaveis = $$("[data-revelar], section.final");
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

  /* ---------- Serviços: "ver entregas" nos cartões compactos ---------- */

  $$(".servico__mais").forEach((botao) =>
    botao.addEventListener("click", () => {
      const cartao = botao.closest(".servico");
      const abrir = !cartao.classList.contains("expandido");
      cartao.classList.toggle("expandido", abrir);
      cartao.style.transform = "";
      cartao.style.setProperty("--escuro", 0);
      botao.setAttribute("aria-expanded", String(abrir));
      botao.firstChild.textContent = abrir ? "Fechar detalhes " : "Ver entregas e o que está incluído ";
      if (!abrir) rolarPara("#" + cartao.id); // ao fechar, volta ao começo do cartão
    })
  );

  /* ---------- Portfólio: painéis, filtros e contador ---------- */

  const paineis = $(".paineis");
  const trabalhos = $$(".trabalho");
  const filtros = $$(".filtro");
  const marcaFiltro = $(".filtros__marca");
  const contAtual = $(".contagem__atual");
  const contTotal = $(".contagem__total");
  const pontos = $(".paineis__pontos");
  const modoCarrossel = matchMedia("(max-width: 880px)");
  const visiveis = () => trabalhos.filter((t) => !t.hidden);

  function moverMarca() {
    const ativo = filtros.find((b) => b.getAttribute("aria-pressed") === "true");
    if (!ativo || !marcaFiltro) return;
    marcaFiltro.style.width = `${ativo.offsetWidth}px`;
    marcaFiltro.style.transform = `translateX(${ativo.offsetLeft}px)`;
  }

  function ativarTrabalho(item) {
    trabalhos.forEach((t) => t.classList.toggle("ativo", t === item));
    const lista = visiveis();
    if (contTotal) contTotal.textContent = dois(lista.length);
    if (contAtual) contAtual.textContent = dois(Math.max(1, lista.indexOf(item) + 1));
    if (pontos) [...pontos.children].forEach((p, i) => p.classList.toggle("ativo", lista[i] === item));
  }

  function montarPontos() {
    if (pontos) pontos.innerHTML = visiveis().map(() => "<span></span>").join("");
  }

  /* No celular: o cartão mais perto do centro cresce e vira o ativo */
  function atualizarCarrossel() {
    if (!paineis) return;
    if (!modoCarrossel.matches) {
      trabalhos.forEach((t) => {
        t.style.removeProperty("--s");
        t.style.removeProperty("--o");
      });
      return;
    }
    const centro = paineis.scrollLeft + paineis.clientWidth / 2;
    let maisPerto = null;
    let menor = Infinity;
    visiveis().forEach((t) => {
      const d = Math.abs(t.offsetLeft + t.offsetWidth / 2 - centro) / t.offsetWidth;
      if (d < menor) {
        menor = d;
        maisPerto = t;
      }
      const k = Math.min(d, 1.5);
      t.style.setProperty("--s", (1 - k * 0.1).toFixed(3));
      t.style.setProperty("--o", (1 - k * 0.45).toFixed(3));
    });
    if (maisPerto && !maisPerto.classList.contains("ativo")) ativarTrabalho(maisPerto);
  }

  function filtrar(servico) {
    filtros.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filtro === servico)));
    trabalhos.forEach((t) => {
      const mostrar = servico === "todos" || t.dataset.servico === servico;
      if (mostrar) {
        t.classList.remove("entrando");
        void t.offsetWidth; // reinicia a animação de entrada
        t.classList.add("entrando");
      }
      t.hidden = !mostrar;
    });
    moverMarca();
    montarPontos();
    if (visiveis()[0]) ativarTrabalho(visiveis()[0]);
    if (paineis) paineis.scrollLeft = 0;
    requestAnimationFrame(atualizarCarrossel);
  }

  filtros.forEach((b) => b.addEventListener("click", () => filtrar(b.dataset.filtro)));
  $$("a[data-filtro]").forEach((a) => a.addEventListener("click", () => filtrar(a.dataset.filtro)));

  trabalhos.forEach((t) => {
    t.addEventListener("mouseenter", () => !modoCarrossel.matches && ativarTrabalho(t));
    t.addEventListener("focus", () => ativarTrabalho(t));
    t.addEventListener("click", () => {
      if (modoCarrossel.matches) {
        paineis.scrollTo({ left: t.offsetLeft + t.offsetWidth / 2 - paineis.clientWidth / 2, behavior: "smooth" });
      } else {
        ativarTrabalho(t);
      }
    });
  });

  if (paineis) {
    let pedido = false;
    paineis.addEventListener(
      "scroll",
      () => {
        if (pedido) return;
        pedido = true;
        requestAnimationFrame(() => {
          pedido = false;
          atualizarCarrossel();
        });
      },
      { passive: true }
    );
  }

  montarPontos();
  if (trabalhos[0]) ativarTrabalho(trabalhos[0]);
  fontesProntas.then(() => {
    moverMarca();
    atualizarCarrossel();
  });

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
      if (cursor) cursor.classList.remove("oculto");
    });
    document.addEventListener("mouseleave", () => cursor && cursor.classList.add("oculto"));
    document.addEventListener("pointerover", (e) => {
      const interativo = e.target.closest("a, button, .trabalho");
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

  const raiz = document.documentElement;
  const progresso = $(".progresso");
  const secaoFinal = $("section.final");
  const linhasHero = $$(".hero .linha");
  const trilho = $(".faixa__trilho");
  const grupoFaixa = $(".faixa__grupo");
  const cartoes = $$(".servico");
  const passos = $$(".passo");
  const linhaProcesso = $(".processo__linha span");
  const contadores = $$(".contador__atual span"); // o do lado (computador) e o da barra (celular)
  const trilhoProcesso = $(".processo__trilho span");
  const passosArea = $(".processo__passos");

  // A faixa precisa de duas cópias para dar a volta sem emenda
  if (trilho && grupoFaixa) trilho.appendChild(grupoFaixa.cloneNode(true));

  // No celular a rolagem por inércia gera picos de velocidade: a faixa reage
  // menos, e o título do hero desliza menos (a tela é estreita)
  const faixaReacao = mouseFino ? { acel: 0.35, max: 60, inclina: 10 } : { acel: 0.15, max: 30, inclina: 4 };
  const fatorTitulo = () => (window.innerWidth > 680 ? 0.12 : 0.07);

  let ultimoY = window.scrollY;
  let yCalculado = NaN;
  let faixaX = 0;
  let faixaDir = 1;
  let faixaInclina = 0;
  let passoAtual = -1;

  window.addEventListener("resize", () => {
    yCalculado = NaN; // força recalcular tudo no próximo quadro
    moverMarca();
    atualizarCarrossel();
  });

  function quadro(tempo) {
    if (lenis) lenis.raf(tempo);

    const y = window.scrollY;
    const vh = window.innerHeight;
    const vel = y - ultimoY;
    ultimoY = y;

    // Faixa: corre sozinha, acelera e inclina com a velocidade da rolagem
    if (!reduzMovimento && trilho && grupoFaixa) {
      if (vel !== 0) faixaDir = vel > 0 ? 1 : -1;
      const largura = grupoFaixa.offsetWidth;
      faixaX -= (0.6 + Math.min(Math.abs(vel), faixaReacao.max) * faixaReacao.acel) * faixaDir;
      if (faixaX <= -largura) faixaX += largura;
      if (faixaX > 0) faixaX -= largura;
      faixaInclina = lerp(faixaInclina, limitar(vel * 0.25, -faixaReacao.inclina, faixaReacao.inclina), 0.1);
      trilho.style.transform = `translate3d(${faixaX.toFixed(1)}px, 0, 0) skewX(${(-faixaInclina).toFixed(2)}deg)`;
    }

    // Faixas "Feito para": o destaque segue o centro a cada quadro (elas se movem sozinhas)
    if (tiposVisiveis) focarTipos();

    // Daqui para baixo, só recalcula quando a rolagem (ou o tamanho) muda
    if (y !== yCalculado) {
      yCalculado = y;
      atualizarRolagem(y, vh);
    }

    if (mouseFino && cursor) {
      rato.cx = lerp(rato.cx, rato.x, 0.22);
      rato.cy = lerp(rato.cy, rato.y, 0.22);
      cursor.style.transform = `translate3d(${rato.cx}px, ${rato.cy}px, 0)`;
    }

    requestAnimationFrame(quadro);
  }

  function atualizarRolagem(y, vh) {
    // Barra de progresso da página
    const total = raiz.scrollHeight - vh;
    if (progresso) progresso.style.transform = `scaleX(${total > 0 ? y / total : 0})`;

    // Menu claro enquanto passa sobre a seção clara do fim
    if (secaoFinal) {
      const rf = secaoFinal.getBoundingClientRect();
      const h = navH();
      document.body.classList.toggle("topo-claro", rf.top <= h && rf.bottom > h);
    }

    // Hero: linhas do título deslizam em direções alternadas
    if (!reduzMovimento && y < vh * 1.2) {
      const fator = fatorTitulo();
      linhasHero.forEach((l) => {
        const dir = Number(l.dataset.dir || 1);
        l.style.transform = `translate3d(${(dir * y * fator).toFixed(1)}px, 0, 0)`;
      });
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
    if (!reduzMovimento) {
      cartoes.forEach((c, i) => {
        const prox = cartoes[i + 1];
        if (!prox || c.classList.contains("expandido")) return;
        const rc = c.getBoundingClientRect();
        const rp = prox.getBoundingClientRect();
        const p = limitar(1 - (rp.top - rc.top) / rc.height, 0, 1);
        c.style.transform = p > 0 ? `scale(${(1 - p * 0.06).toFixed(4)})` : "";
        c.style.setProperty("--escuro", (p * 0.5).toFixed(3));
      });
    }

    // Processo: linha que preenche e contador da etapa atual
    if (passosArea) {
      const r = passosArea.getBoundingClientRect();
      const p = limitar((vh * 0.55 - r.top) / r.height, 0, 1);
      if (linhaProcesso) linhaProcesso.style.setProperty("--p", p.toFixed(4));
      if (trilhoProcesso) trilhoProcesso.style.setProperty("--p", p.toFixed(4));
      let idx = 0;
      passos.forEach((s, i) => {
        if (s.getBoundingClientRect().top < vh * 0.55) idx = i;
      });
      if (idx !== passoAtual) {
        passoAtual = idx;
        passos.forEach((s, i) => s.classList.toggle("atual", i <= idx));
        // O número sai por cima e o novo entra por baixo
        contadores.forEach((contador) => {
          contador.style.transform = "translateY(-100%)";
          setTimeout(() => {
            contador.textContent = dois(idx + 1);
            contador.style.transition = "none";
            contador.style.transform = "translateY(100%)";
            requestAnimationFrame(() => {
              contador.style.transition = "";
              contador.style.transform = "";
            });
          }, reduzMovimento ? 0 : 280);
        });
      }
    }
  }

  requestAnimationFrame(quadro);
})();

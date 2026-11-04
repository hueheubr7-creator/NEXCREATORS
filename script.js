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

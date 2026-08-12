/* NEX Creators — interações discretas */

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

  /* Formulário → encaminha ao canal oficial no WhatsApp */
  const form = document.getElementById("formContato");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = form.nome.value.trim();
      const perfil = form.perfil.value.trim();
      const plataformas = form.plataformas.value.trim();
      const audiencia = form.audiencia.value.trim();
      const mensagem = form.mensagem.value.trim();

      if (!nome) {
        form.nome.focus();
        return;
      }

      const partes = [
        "Olá, NEX Creators!",
        `Meu nome é ${nome}.`,
        perfil ? `Perfil principal: ${perfil}.` : "",
        plataformas ? `Plataformas: ${plataformas}.` : "",
        audiencia ? `Audiência: ${audiencia}.` : "",
        mensagem ? mensagem : "",
      ].filter(Boolean);

      const url =
        "https://wa.me/5517981428839?text=" +
        encodeURIComponent(partes.join(" "));
      window.open(url, "_blank", "noopener");
    });
  }
})();

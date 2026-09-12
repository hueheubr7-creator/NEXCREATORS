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

  /* Formulário de captação → mensagem pronta no WhatsApp oficial */
  const WHATSAPP = "https://wa.me/5517981428839";
  const form = document.getElementById("formContato");
  if (!form) return;

  const fields = {
    instagram: form.elements.instagram,
    seguidores: form.elements.seguidores,
    stories: form.elements.stories,
  };

  /* Aceita "@perfil", "perfil" ou o link do perfil colado do app */
  function instagramHandle(raw) {
    const semLink = raw
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/^(www\.)?instagram\.com\//i, "");
    return semLink.split(/[/?#\s]/)[0].replace(/^@+/, "");
  }

  /* 50000 → 50.000, mantendo o cursor no lugar enquanto a pessoa digita */
  function formatThousands(input) {
    const caretDigits = input.value
      .slice(0, input.selectionStart)
      .replace(/\D/g, "").length;
    const digits = input.value
      .replace(/\D/g, "")
      .replace(/^0+(?=\d)/, "")
      .slice(0, 12);
    const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    input.value = formatted;

    let caret = 0;
    let seen = 0;
    while (caret < formatted.length && seen < caretDigits) {
      if (/\d/.test(formatted[caret])) seen++;
      caret++;
    }
    input.setSelectionRange(caret, caret);
  }

  function setError(input, message) {
    const error = document.getElementById(input.getAttribute("aria-describedby"));
    if (message) {
      input.setAttribute("aria-invalid", "true");
      error.textContent = message;
      error.hidden = false;
    } else {
      input.removeAttribute("aria-invalid");
      error.textContent = "";
      error.hidden = true;
    }
  }

  function validate() {
    const handle = instagramHandle(fields.instagram.value);
    const erros = {
      instagram: !handle
        ? "Informe o @ do seu Instagram."
        : !/^[A-Za-z0-9._]{1,30}$/.test(handle)
        ? "Esse @ não parece válido. Use só letras, números, ponto e _."
        : "",
      seguidores: /\d/.test(fields.seguidores.value)
        ? ""
        : "Informe quantos seguidores você tem.",
      stories: /\d/.test(fields.stories.value)
        ? ""
        : "Informe a média de visualizações dos seus stories.",
    };

    Object.keys(fields).forEach((key) => setError(fields[key], erros[key]));
    const primeiroErro = Object.keys(fields).find((key) => erros[key]);
    if (primeiroErro) fields[primeiroErro].focus();
    return { ok: !primeiroErro, handle };
  }

  [fields.seguidores, fields.stories].forEach((input) =>
    input.addEventListener("input", () => {
      formatThousands(input);
      setError(input, "");
    })
  );

  fields.instagram.addEventListener("input", () => setError(fields.instagram, ""));
  fields.instagram.addEventListener("blur", () => {
    const handle = instagramHandle(fields.instagram.value);
    if (handle) fields.instagram.value = "@" + handle;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const { ok, handle } = validate();
    if (!ok) return;

    const mensagem = [
      "Olá, NEX Creators! Quero ser um influenciador NEX.",
      "",
      `Instagram: @${handle} (instagram.com/${handle})`,
      `Seguidores: ${fields.seguidores.value}`,
      `Média de visualizações nos stories: ${fields.stories.value}`,
    ].join("\n");

    /* Mesma aba: pop-ups costumam ser bloqueados nos navegadores internos
       do Instagram e do Facebook, de onde vem o tráfego dos anúncios */
    window.location.href = `${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
  });
})();

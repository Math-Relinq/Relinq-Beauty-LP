/**
 * Navegação complementar: botão de rolar para a próxima seção.
 */
function initScrollCue() {
  const cues = document.querySelectorAll("[data-scroll-next]");
  cues.forEach((cue) => {
    cue.addEventListener("click", () => {
      const current = cue.closest(".section");
      const container = current ? current.parentElement : null;
      const next = current ? current.nextElementSibling : null;
      if (next && container) container.scrollTo({ top: next.offsetTop, behavior: "smooth" });
    });
  });
}

function bindCtaLinks() {
  document.querySelectorAll("[data-cta-link]").forEach((el) => {
    el.href = CTA_URL;
    el.target = "_blank";
    el.rel = "noopener";
  });
}

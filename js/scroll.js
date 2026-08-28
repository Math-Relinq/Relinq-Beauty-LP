/**
 * Comportamentos de scroll: encaixe entre seções e animação de entrada dos elementos.
 */
function initScrollAnimations() {
  const targets = document.querySelectorAll("[data-animate]");
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  targets.forEach((el) => observer.observe(el));
}

function initPersistentCta() {
  const container = document.querySelector("[data-snap-container]");
  const ctaLabel = document.querySelector("[data-cta-label-target]");
  if (!container || !ctaLabel) return;
  const sections = Array.from(container.querySelectorAll(".section[data-cta-label]"));
  if (!sections.length) return;

  const setLabel = (section) => {
    const label = section.dataset.ctaLabel;
    if (label && ctaLabel.textContent !== label) ctaLabel.textContent = label;
  };

  // As seções alternam o fundo entre --bg-page e --bg-page-alt (ver css/global.css). O fade da
  // cta-bar fixa precisa acompanhar essa cor para não criar uma costura visível onde ela encosta
  // na seção visível por baixo.
  const updateCtaFade = (section) => {
    const isEven = sections.indexOf(section) % 2 === 1;
    document.documentElement.style.setProperty(
      "--cta-fade-rgb",
      isEven ? "var(--bg-page-alt-rgb)" : "var(--bg-page-rgb)"
    );
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setLabel(entry.target);
          updateCtaFade(entry.target);
        }
      });
    },
    { root: container, threshold: 0.5 }
  );

  sections.forEach((section) => observer.observe(section));
  setLabel(sections[0]);
  updateCtaFade(sections[0]);
}

function initSectionKeyboardNav() {
  const container = document.querySelector("[data-snap-container]");
  if (!container) return;
  const sections = Array.from(container.querySelectorAll(".section"));

  function currentSectionIndex() {
    const containerTop = container.scrollTop;
    let closest = 0;
    let minDiff = Infinity;
    sections.forEach((section, i) => {
      const diff = Math.abs(section.offsetTop - containerTop);
      if (diff < minDiff) {
        minDiff = diff;
        closest = i;
      }
    });
    return closest;
  }

  window.addEventListener("keydown", (e) => {
    if (!["ArrowDown", "PageDown", "ArrowUp", "PageUp"].includes(e.key)) return;
    const focusTag = document.activeElement && document.activeElement.tagName;
    if (["INPUT", "TEXTAREA"].includes(focusTag)) return;

    e.preventDefault();
    const idx = currentSectionIndex();
    const nextIdx =
      e.key === "ArrowDown" || e.key === "PageDown"
        ? Math.min(idx + 1, sections.length - 1)
        : Math.max(idx - 1, 0);
    container.scrollTo({ top: sections[nextIdx].offsetTop, behavior: "smooth" });
  });
}

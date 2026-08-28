/**
 * Carrossel genérico baseado em scroll nativo + scroll-snap.
 * Alimenta tanto o carrossel de depoimentos quanto o de preços.
 */
class Carousel {
  constructor(root) {
    this.root = root;
    this.track = root.querySelector("[data-carousel-track]");
    this.prevBtn = root.querySelector("[data-carousel-prev]");
    this.nextBtn = root.querySelector("[data-carousel-next]");
    this.dotsWrap = root.querySelector("[data-carousel-dots]");
    this.autoplay = root.dataset.autoplay === "true";
    this.interval = parseInt(root.dataset.interval, 10) || 3000;
    this.resumeDelay = parseInt(root.dataset.resumeDelay, 10) || 4000;
    this.timer = null;
    this.resumeTimer = null;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!this.track) return;
    this.slides = Array.from(this.track.children);
    this.buildDots();
    this.bindEvents();
    this.updateControls();
    if (this.autoplay && !this.reducedMotion) this.startAutoplay();
  }

  get slideStep() {
    const first = this.slides[0];
    if (!first) return 0;
    const style = getComputedStyle(this.track);
    const gap = parseFloat(style.columnGap || style.gap || "0");
    return first.getBoundingClientRect().width + gap;
  }

  buildDots() {
    if (!this.dotsWrap) return;
    this.dotsWrap.innerHTML = "";
    this.slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `Ir para o item ${i + 1}`);
      dot.addEventListener("click", () => {
        this.scrollToIndex(i);
        this.pauseAndScheduleResume();
      });
      this.dotsWrap.appendChild(dot);
    });
  }

  bindEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => {
        this.scrollByStep(-1);
        this.pauseAndScheduleResume();
      });
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => {
        this.scrollByStep(1);
        this.pauseAndScheduleResume();
      });
    }

    ["pointerdown", "touchstart"].forEach((evt) =>
      this.track.addEventListener(evt, () => this.pauseAutoplay(), { passive: true })
    );
    ["pointerup", "touchend", "mouseleave"].forEach((evt) =>
      this.track.addEventListener(evt, () => this.pauseAndScheduleResume(), { passive: true })
    );

    let scrollTimeout;
    this.track.addEventListener(
      "scroll",
      () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => this.updateControls(), 100);
      },
      { passive: true }
    );

    window.addEventListener("resize", () => this.updateControls());
  }

  currentIndex() {
    const step = this.slideStep || 1;
    return Math.round(this.track.scrollLeft / step);
  }

  scrollToIndex(index) {
    const clamped = Math.max(0, Math.min(index, this.slides.length - 1));
    this.track.scrollTo({ left: clamped * this.slideStep, behavior: "smooth" });
  }

  scrollByStep(direction) {
    const maxScroll = this.track.scrollWidth - this.track.clientWidth;
    if (maxScroll <= 0) return;
    // Só dá a volta (wrap) quando já estamos na ponta antes de mover — checar isso a partir
    // do "next" calculado (como antes) dava falso positivo perto do último slide, fazendo o
    // carrossel voltar ao início em vez de avançar para o último item.
    const atStart = this.track.scrollLeft <= 2;
    const atEnd = this.track.scrollLeft >= maxScroll - 2;
    if (direction > 0 && atEnd) {
      this.track.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (direction < 0 && atStart) {
      this.track.scrollTo({ left: maxScroll, behavior: "smooth" });
      return;
    }
    const next = this.track.scrollLeft + direction * this.slideStep;
    this.track.scrollTo({ left: Math.max(0, Math.min(next, maxScroll)), behavior: "smooth" });
  }

  updateControls() {
    const idx = this.currentIndex();
    if (this.dotsWrap) {
      Array.from(this.dotsWrap.children).forEach((dot, i) =>
        dot.classList.toggle("is-active", i === idx)
      );
    }
    const maxScroll = this.track.scrollWidth - this.track.clientWidth;
    const atStart = this.track.scrollLeft <= 2;
    const atEnd = this.track.scrollLeft >= maxScroll - 2;
    const isCyclable = this.autoplay;
    if (this.prevBtn) this.prevBtn.disabled = !isCyclable && atStart;
    if (this.nextBtn) this.nextBtn.disabled = !isCyclable && (atEnd || maxScroll <= 0);
  }

  startAutoplay() {
    this.stopAutoplay();
    this.timer = setInterval(() => this.scrollByStep(1), this.interval);
  }

  stopAutoplay() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  pauseAutoplay() {
    this.stopAutoplay();
    if (this.resumeTimer) clearTimeout(this.resumeTimer);
  }

  pauseAndScheduleResume() {
    this.stopAutoplay();
    if (this.resumeTimer) clearTimeout(this.resumeTimer);
    if (this.autoplay && !this.reducedMotion) {
      this.resumeTimer = setTimeout(() => this.startAutoplay(), this.resumeDelay);
    }
  }

  refresh() {
    this.slides = Array.from(this.track.children);
    this.buildDots();
    this.updateControls();
  }
}

function initCarousels(selector = "[data-carousel]") {
  return Array.from(document.querySelectorAll(selector)).map((el) => new Carousel(el));
}

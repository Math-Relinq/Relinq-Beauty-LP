/* ==========================================================================
   Relinq Beauty — script único

   Organização:
     1. Utilitários
     2. Dados dos planos      (preços vêm de precos-dos-planos.js)
     3. Carrossel             (classe reutilizada por depoimentos e planos)
     4. Módulos               (uma função init* por funcionalidade)
     5. Inicialização

   Convenções:
     • O JS encontra os elementos SÓ por atributo data-* — nunca por id ou por
       classe de estilo. Assim, mexer no CSS nunca quebra o comportamento.
     • Todo módulo é uma função init* que sai calada se o elemento não existir.
   ========================================================================== */

(() => {
  "use strict";

  /* ========================================================================
     1. UTILITÁRIOS
     ======================================================================== */

  const $  = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  /** 1234.5 -> "1.234,50" */
  const formatBRL = (value) =>
    value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /** Adia `fn` até o teclado virtual terminar de fechar (ou 500ms).
   *  Medir/centralizar algo enquanto o teclado ainda encolhe o viewport
   *  calcula o "centro" errado e o elemento acaba parando alto demais. */
  const afterKeyboardCloses = (fn) => {
    const vv = window.visualViewport;
    const isClosed = () => !vv || window.innerHeight - vv.height < 40;
    if (isClosed()) return fn();

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      vv.removeEventListener("resize", onResize);
      fn();
    };
    const onResize = () => isClosed() && finish();

    vv.addEventListener("resize", onResize);
    setTimeout(finish, 500);
  };

  /* ========================================================================
     2. DADOS DOS PLANOS
     Preços e descontos vêm de precos-dos-planos.js (carregado antes deste).
     Se aquele arquivo faltar ou tiver erro de digitação, cada valor cai no
     padrão abaixo e a página continua funcionando.
     ======================================================================== */

  const CTA_URL = "https://app.relinq.com.br/cadastro";

  const precos = typeof PRECOS_DOS_PLANOS !== "undefined" ? PRECOS_DOS_PLANOS : {};
  const preco      = (plano, campo, padrao) => precos[plano]?.[campo] ?? padrao;
  const precoCiclo = (plano, ciclo, padrao) => precos[plano]?.precos?.[ciclo] ?? padrao;
  const desconto   = (ciclo, padrao) => precos.descontos?.[ciclo] ?? padrao;

  const BILLING_CYCLES = [
    { id: "monthly",    label: "Mensal",     discount: desconto("mensal", 0) },
    { id: "quarterly",  label: "Trimestral", discount: desconto("trimestral", 10) },
    { id: "semiannual", label: "Semestral",  discount: desconto("semestral", 15) },
    { id: "annual",     label: "Anual",      discount: desconto("anual", 20) },
  ];

  const PLANS = [
    {
      name: "Gratuito",
      highlighted: false,
      badge: null,
      /* "fixed" = o desconto do ciclo não se aplica (plano sempre R$ 0,00) */
      priceType: "fixed",
      price: preco("gratuito", "preco", 0),
      priceSuffix: preco("gratuito", "sufixo", "/mês"),
      description: "Para tirar o salão do caderno sem gastar nada.",
      ctaLabel: "Criar minha conta grátis",
      features: [
        [true,  "Até 15 agendamentos por mês"],
        [true,  "Site próprio para agendamentos"],
        [true,  "Sem custo e sem cartão de crédito"],
        [false, "Lembretes automáticos via WhatsApp"],
        [false, "Controle de caixa e gestão financeira"],
        [false, "Lista de espera, cupons e avaliações"],
      ],
    },
    {
      name: "Essential",
      highlighted: false,
      badge: null,
      priceType: "per-user",
      price: precoCiclo("essential", "mensal", 24.9),
      pricesByCycle: {
        monthly:    precoCiclo("essential", "mensal", 24.9),
        quarterly:  precoCiclo("essential", "trimestral", 22.4),
        semiannual: precoCiclo("essential", "semestral", 21.15),
        annual:     precoCiclo("essential", "anual", 19.9),
      },
      priceSuffix: preco("essential", "sufixo", "/mês por usuário"),
      description: "Para organizar a agenda e reduzir as faltas.",
      ctaLabel: "Começar com o Essential",
      features: [
        [true,  "Agendamentos ilimitados"],
        [true,  "Site próprio incluso"],
        [true,  "Até 50 lembretes automáticos via WhatsApp/mês"],
        [false, "Controle de caixa e gestão financeira"],
        [false, "Lista de espera, cupons e avaliações"],
      ],
    },
    {
      name: "Pro",
      highlighted: true,
      badge: "Mais popular",
      priceType: "per-user",
      price: precoCiclo("pro", "mensal", 49.9),
      pricesByCycle: {
        monthly:    precoCiclo("pro", "mensal", 49.9),
        quarterly:  precoCiclo("pro", "trimestral", 44.9),
        semiannual: precoCiclo("pro", "semestral", 42.4),
        annual:     precoCiclo("pro", "anual", 39.9),
      },
      priceSuffix: preco("pro", "sufixo", "/mês por usuário"),
      description: "Para quem quer o salão rodando no piloto automático.",
      ctaLabel: "Começar com o Pro",
      features: [
        [true, "Agendamentos e lembretes via WhatsApp ilimitados"],
        [true, "Controle de caixa e gestão financeira avançados"],
        [true, "Lista de espera e gestão de cupons"],
        [true, "Avaliações de clientes direto no painel"],
        [true, "Todos os recursos habilitados"],
      ],
    },
  ];

  /* ========================================================================
     3. CARROSSEL
     Rolagem nativa com scroll-snap (o CSS faz o trabalho pesado). Esta classe
     só move o scrollLeft, monta os dots e liga/desliga as setas.
     ======================================================================== */

  class Carousel {
    constructor(root) {
      this.root  = root;
      this.track = $("[data-track]", root);
      if (!this.track) return;

      this.prevBtn = $("[data-prev]", root);
      this.nextBtn = $("[data-next]", root);
      this.dotsBox = $("[data-dots]", root);

      this.autoplay    = root.dataset.autoplay === "true";
      this.interval    = Number(root.dataset.interval) || 3000;
      this.resumeDelay = Number(root.dataset.resumeDelay) || 4000;
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      this.timer = null;
      this.resumeTimer = null;

      this.refresh();
      this.bindEvents();
      if (this.canAutoplay) this.startAutoplay();
    }

    get canAutoplay() { return this.autoplay && !this.reducedMotion; }

    /** Largura de um slide + o vão até o próximo. */
    get step() {
      const first = this.slides[0];
      if (!first) return 0;
      const styles = getComputedStyle(this.track);
      const gap = parseFloat(styles.columnGap || styles.gap || "0");
      return first.getBoundingClientRect().width + gap;
    }

    get maxScroll() { return this.track.scrollWidth - this.track.clientWidth; }

    /** Relê os slides do DOM. Chamado quando os cards são re-renderizados. */
    refresh() {
      this.slides = [...this.track.children];
      this.buildDots();
      this.updateControls();
    }

    buildDots() {
      if (!this.dotsBox) return;
      this.dotsBox.innerHTML = "";
      this.slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel__dot";
        dot.setAttribute("aria-label", `Ir para o item ${i + 1}`);
        dot.addEventListener("click", () => {
          this.scrollToIndex(i);
          this.pauseThenResume();
        });
        this.dotsBox.appendChild(dot);
      });
    }

    bindEvents() {
      this.prevBtn?.addEventListener("click", () => { this.slide(-1); this.pauseThenResume(); });
      this.nextBtn?.addEventListener("click", () => { this.slide(1);  this.pauseThenResume(); });

      // Enquanto o dedo/mouse está no carrossel, o autoplay não atrapalha.
      ["pointerdown", "touchstart"].forEach((evt) =>
        this.track.addEventListener(evt, () => this.stopAutoplay(true), { passive: true })
      );
      ["pointerup", "touchend", "mouseleave"].forEach((evt) =>
        this.track.addEventListener(evt, () => this.pauseThenResume(), { passive: true })
      );

      let scrollTimer;
      this.track.addEventListener("scroll", () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => this.updateControls(), 100);
      }, { passive: true });

      window.addEventListener("resize", () => this.updateControls());
    }

    scrollTo(left) { this.track.scrollTo({ left, behavior: "smooth" }); }

    /** Rola suavemente até o primeiro slide e chama `done` quando a animação
     *  termina (ou de imediato, se já estivermos no início). Usado quando os
     *  cards vão ser re-renderizados. */
    scrollToStart(done) {
      if (this.track.scrollLeft <= 2) return void done?.();

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        this.track.removeEventListener("scrollend", finish);
        this.updateControls();
        done?.();
      };
      // "scrollend" resolve assim que a rolagem para; o timeout é o plano B
      // para browsers que ainda não disparam esse evento.
      const timer = setTimeout(finish, 500);
      this.track.addEventListener("scrollend", finish);
      this.scrollTo(0);
    }

    scrollToIndex(index) {
      const clamped = Math.min(Math.max(index, 0), this.slides.length - 1);
      this.scrollTo(clamped * this.step);
    }

    /** Avança (1) ou volta (-1) um slide, dando a volta nas pontas. */
    slide(direction) {
      const { maxScroll } = this;
      if (maxScroll <= 0) return;

      // A volta só acontece se JÁ estivermos na ponta antes de mover; testar a
      // posição de destino daria falso positivo perto do último slide.
      if (direction > 0 && this.isAtEnd)   return this.scrollTo(0);
      if (direction < 0 && this.isAtStart) return this.scrollTo(maxScroll);

      const next = this.track.scrollLeft + direction * this.step;
      this.scrollTo(Math.min(Math.max(next, 0), maxScroll));
    }

    get isAtStart() { return this.track.scrollLeft <= 2; }
    get isAtEnd()   { return this.track.scrollLeft >= this.maxScroll - 2; }

    updateControls() {
      if (this.dotsBox) {
        const current = Math.round(this.track.scrollLeft / (this.step || 1));
        [...this.dotsBox.children].forEach((dot, i) => dot.classList.toggle("is-active", i === current));
      }
      // Carrossel com autoplay dá a volta, então as setas nunca desligam.
      if (this.prevBtn) this.prevBtn.disabled = !this.autoplay && this.isAtStart;
      if (this.nextBtn) this.nextBtn.disabled = !this.autoplay && (this.isAtEnd || this.maxScroll <= 0);
    }

    startAutoplay() {
      this.stopAutoplay();
      this.timer = setInterval(() => this.slide(1), this.interval);
    }

    /** `alsoCancelResume` impede que um autoplay já agendado volte sozinho. */
    stopAutoplay(alsoCancelResume = false) {
      clearInterval(this.timer);
      this.timer = null;
      if (alsoCancelResume) clearTimeout(this.resumeTimer);
    }

    pauseThenResume() {
      this.stopAutoplay(true);
      if (this.canAutoplay) this.resumeTimer = setTimeout(() => this.startAutoplay(), this.resumeDelay);
    }
  }

  /* ========================================================================
     4. MÓDULOS
     ======================================================================== */

  /** Aponta todos os CTAs para a URL de cadastro. */
  const initCtaLinks = () => {
    $$("[data-cta-link]").forEach((link) => {
      link.href = CTA_URL;
      link.target = "_blank";
      link.rel = "noopener";
    });
  };

  /** Revela cada elemento [data-reveal] quando ele entra na tela (uma vez só). */
  const initReveal = () => {
    const targets = $$("[data-reveal]");
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        target.classList.add("is-visible");
        observer.unobserve(target);
      });
    }, { threshold: 0.2 });

    targets.forEach((el) => observer.observe(el));
  };

  /** Setas e PageUp/PageDown pulam de seção em seção. */
  const initKeyboardNav = () => {
    const scroller = $("[data-scroller]");
    if (!scroller) return;
    const sections = $$(".section", scroller);

    window.addEventListener("keydown", (e) => {
      const keys = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 };
      const direction = keys[e.key];
      if (!direction) return;
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

      e.preventDefault();
      // seção atual = a que começa mais perto do topo da área visível
      const distances = sections.map((s) => Math.abs(s.offsetTop - scroller.scrollTop));
      const current = distances.indexOf(Math.min(...distances));
      const target = sections[Math.min(Math.max(current + direction, 0), sections.length - 1)];
      scroller.scrollTo({ top: target.offsetTop, behavior: "smooth" });
    });
  };

  /** A barra de CTA fixa muda de texto e de cor conforme a seção visível. */
  const initStickyCta = () => {
    const scroller = $("[data-scroller]");
    const label = $("[data-cta-link]");
    if (!scroller || !label) return;

    const sections = $$(".section[data-cta-label]", scroller);
    if (!sections.length) return;

    // O degradê da barra precisa nascer da cor da seção de baixo, senão fica
    // uma costura visível onde as duas se encontram (ver .section:nth-of-type).
    const apply = (section) => {
      const { ctaLabel } = section.dataset;
      if (ctaLabel && label.textContent !== ctaLabel) label.textContent = ctaLabel;

      const isAlt = sections.indexOf(section) % 2 === 1;
      document.documentElement.style.setProperty(
        "--cta-fade-rgb",
        isAlt ? "var(--bg-page-alt-rgb)" : "var(--bg-page-rgb)"
      );
    };

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && apply(e.target)),
      { root: scroller, threshold: 0.5 }
    );
    sections.forEach((s) => observer.observe(s));
    apply(sections[0]);
  };

  /* -- Planos --------------------------------------------------------------- */

  const priceForCycle = (plan, cycle) =>
    plan.priceType === "fixed" ? plan.price : (plan.pricesByCycle?.[cycle.id] ?? plan.price);

  const billingOptionHTML = (cycle, isActive) => `
    <button type="button" class="billing-toggle__option${isActive ? " is-active" : ""}" data-cycle="${cycle.id}">
      ${cycle.label}${cycle.discount ? `<span class="billing-toggle__discount">-${cycle.discount}%</span>` : ""}
    </button>`;

  const planCardHTML = (plan, cycle) => {
    const finalPrice = priceForCycle(plan, cycle);
    const hasDiscount = plan.priceType !== "fixed" && cycle.discount > 0;

    const features = plan.features
      .map(([included, text]) => `
        <li class="pricing-card__feature${included ? "" : " pricing-card__feature--muted"}">
          <span class="pricing-card__feature-icon">${included ? "✓" : "–"}</span>${text}
        </li>`)
      .join("");

    return `
      <div class="carousel__slide">
        <div class="pricing-card${plan.highlighted ? " pricing-card--highlighted" : ""}">
          ${plan.badge ? `<span class="badge badge--dark pricing-card__badge">${plan.badge}</span>` : ""}
          <div class="pricing-card__name">${plan.name}</div>
          <div class="pricing-card__price-row">
            ${hasDiscount ? `<span class="pricing-card__price-original">R$ ${formatBRL(plan.price)}</span>` : ""}
            <span class="pricing-card__price${hasDiscount ? " pricing-card__price--discount" : ""}">${hasDiscount ? "para " : ""}R$ ${formatBRL(finalPrice)}</span>
            <span class="pricing-card__price-suffix">${plan.priceSuffix}</span>
          </div>
          <p class="pricing-card__desc">${plan.description}</p>
          <ul class="pricing-card__features">${features}</ul>
          <a href="${CTA_URL}" target="_blank" rel="noopener" class="btn btn--primary btn--block">${plan.ctaLabel}</a>
        </div>
      </div>`;
  };

  /** Monta o seletor de ciclo e os cards, e re-renderiza a cada troca. */
  const initPricing = () => {
    const section = $("[data-pricing]");
    if (!section) return;

    const toggle   = $("[data-billing-toggle]", section);
    const track    = $("[data-track]", section);
    const carousel = new Carousel($("[data-carousel]", section));
    let activeId   = BILLING_CYCLES[0].id;

    const render = () => {
      const cycle = BILLING_CYCLES.find((c) => c.id === activeId);
      toggle.innerHTML = BILLING_CYCLES.map((c) => billingOptionHTML(c, c.id === activeId)).join("");
      track.innerHTML  = PLANS.map((plan) => planCardHTML(plan, cycle)).join("");
      carousel.refresh();
    };

    // Um listener só no container, em vez de um por botão — os botões são
    // recriados a cada render e este sobrevive a todos eles.
    toggle.addEventListener("click", (e) => {
      const id = e.target.closest("[data-cycle]")?.dataset.cycle;
      if (!id || id === activeId) return;
      activeId = id;
      // Marca o novo ciclo já; os cards só trocam depois que o carrossel
      // termina de rolar de volta para o primeiro plano.
      toggle.innerHTML = BILLING_CYCLES.map((c) => billingOptionHTML(c, c.id === activeId)).join("");
      carousel.scrollToStart(render);
    });

    render();
  };

  /* -- Calculadora do prejuízo ---------------------------------------------- */

  /** Assim que os 3 campos ficam preenchidos, a moldura da calculadora cresce e
   *  aparecem (com fade-in via CSS) 3 bolinhas de loading, e a tela rola até
   *  elas — SEM tirar o foco do campo. Depois de 1s as bolinhas dão lugar ao
   *  resultado; só aí o campo é desselecionado e a tela reajusta. */
  const LOADING_MS = 1000;

  const initCalculator = () => {
    const inputs  = $$("[data-calc-input]");
    const result  = $("[data-calc-result]");
    const loading = $("[data-calc-loading]");
    const body    = $("[data-calc-result-body]");
    const value   = $("[data-calc-result-value]");
    if (!inputs.length || !result || !loading || !body || !value) return;

    let phase = "hidden"; // "hidden" | "loading" | "result"
    let pendingTimer = null;

    const readValues = () => inputs.map((el) => el.value.replace(",", "."));
    const allFilled = (values) =>
      values.every((v) => v !== "" && !isNaN(Number(v)));

    const hide = () => {
      phase = "hidden";
      result.hidden = true;
      result.classList.remove("is-visible");
      loading.hidden = false; // volta ao estado de loading para a próxima vez
      body.hidden = true;
    };

    const showLoading = () => {
      phase = "loading";
      loading.hidden = false;
      body.hidden = true;
      result.hidden = false;
      // dispara o fade-in + o crescimento da moldura
      result.classList.add("is-visible");
      result.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const showResult = (input) => {
      phase = "result";
      loading.hidden = true;
      body.hidden = false;
      // só agora o campo perde o foco (fecha o teclado)
      input.blur();
      afterKeyboardCloses(() => {
        if (phase !== "result") return;
        result.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    };

    const onInput = (input) => {
      const values = readValues();

      if (!allFilled(values)) {
        clearTimeout(pendingTimer);
        pendingTimer = null;
        if (phase !== "hidden") hide();
        return;
      }

      // Mantém o número em dia mesmo antes de aparecer (e depois, se editarem).
      const annualSaving = values.reduce((total, v) => total * Number(v), 12);
      value.textContent = `R$ ${formatBRL(annualSaving)}`;

      if (phase !== "hidden" || pendingTimer) return;

      showLoading();
      pendingTimer = setTimeout(() => {
        pendingTimer = null;
        if (!allFilled(readValues())) { hide(); return; }
        showResult(input);
      }, LOADING_MS);
    };

    inputs.forEach((input) => input.addEventListener("input", () => onInput(input)));
  };

  /** No celular, mantém o campo em edição acima do teclado virtual.
   *  Rola o container único da página — nunca a seção — para não criar uma
   *  segunda barra de rolagem presa no meio da tela. */
  const initKeyboardScrollFix = () => {
    const inputs = $$("[data-calc-input]");
    const scroller = $("[data-scroller]");
    const vv = window.visualViewport;
    if (!inputs.length || !scroller || !vv) return;

    let activeInput = null;
    let timer = null;

    const adjust = () => {
      if (!activeInput) return;
      const margin = 16;
      const top = vv.offsetTop;
      const bottom = vv.offsetTop + vv.height;
      const rect = activeInput.getBoundingClientRect();

      if (rect.bottom > bottom - margin) {
        scroller.scrollBy({ top: rect.bottom - (bottom - margin), behavior: "smooth" });
      } else if (rect.top < top + margin) {
        scroller.scrollBy({ top: rect.top - (top + margin), behavior: "smooth" });
      }
    };

    // focus + resize + scroll disparam em sequência durante a animação do
    // teclado; sem o debounce, vários scrollBy("smooth") brigam entre si.
    const schedule = (delay) => {
      clearTimeout(timer);
      timer = setTimeout(adjust, delay);
    };

    inputs.forEach((input) => {
      input.addEventListener("focus", () => { activeInput = input; schedule(300); });
      input.addEventListener("blur",  () => { if (activeInput === input) activeInput = null; });
    });

    vv.addEventListener("resize", () => schedule(80));
    vv.addEventListener("scroll", () => schedule(80));
  };

  /* ========================================================================
     5. INICIALIZAÇÃO
     ======================================================================== */

  document.addEventListener("DOMContentLoaded", () => {
    initCtaLinks();
    initReveal();
    initKeyboardNav();
    initStickyCta();
    initPricing();

    // Carrosséis estáticos (depoimentos). O de planos é criado em initPricing,
    // porque precisa ser re-lido a cada troca de ciclo. A ordem importa: o
    // autoplay dos depoimentos começa a contar aqui.
    $$("[data-carousel]:not([data-pricing-carousel])").forEach((el) => new Carousel(el));

    initCalculator();
    initKeyboardScrollFix();
  });
})();

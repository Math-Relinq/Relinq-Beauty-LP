/**
 * Ponto de entrada da landing page.
 */
(function () {
  function formatPrice(value) {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function priceForCycle(plan, cycle) {
    if (plan.priceType === "fixed") return plan.price;
    const discount = cycle.discount || 0;
    return plan.price * (1 - discount / 100);
  }

  // Espera o teclado virtual (se houver) terminar de fechar antes de rodar `cb`. Centralizar o
  // resultado da calculadora enquanto o teclado ainda está encolhendo o viewport calcula o
  // "centro" errado: assim que o teclado termina de fechar e o viewport volta a crescer, o
  // elemento fica bem mais acima do que o centro real da tela.
  function waitForKeyboardClose(cb) {
    if (!window.visualViewport) {
      cb();
      return;
    }
    const vv = window.visualViewport;
    if (window.innerHeight - vv.height < 40) {
      cb();
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      vv.removeEventListener("resize", onResize);
      cb();
    };
    const onResize = () => {
      if (window.innerHeight - vv.height < 40) finish();
    };
    vv.addEventListener("resize", onResize);
    setTimeout(finish, 500);
  }

  function renderBillingToggle(container, activeId, onChange) {
    container.innerHTML = "";
    BILLING_CYCLES.forEach((cycle) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "billing-toggle__option" + (cycle.id === activeId ? " is-active" : "");
      btn.dataset.cycle = cycle.id;
      btn.innerHTML =
        cycle.label + (cycle.discount ? `<span class="billing-toggle__discount">-${cycle.discount}%</span>` : "");
      btn.addEventListener("click", () => onChange(cycle.id));
      container.appendChild(btn);
    });
  }

  function renderPricingCards(track, activeCycleId) {
    const cycle = BILLING_CYCLES.find((c) => c.id === activeCycleId) || BILLING_CYCLES[0];
    track.innerHTML = PLANS.map((plan) => {
      const finalPrice = priceForCycle(plan, cycle);
      const hasDiscount = plan.priceType !== "fixed" && cycle.discount > 0;
      const featuresHtml = plan.features
        .map(
          (f) => `<li class="pricing-card__feature${f.included ? "" : " pricing-card__feature--muted"}">
            <span class="pricing-card__feature-icon">${f.included ? "✓" : "–"}</span>${f.text}
          </li>`
        )
        .join("");

      return `
        <div class="carousel-slide">
          <div class="pricing-card${plan.highlighted ? " pricing-card--highlighted" : ""}">
            ${plan.badge ? `<span class="badge badge--dark pricing-card__badge">${plan.badge}</span>` : ""}
            <div class="pricing-card__name">${plan.name}</div>
            <div class="pricing-card__price-row">
              ${
                hasDiscount
                  ? `<span class="pricing-card__price-original">de R$ ${formatPrice(plan.price)}</span>`
                  : ""
              }
              <span class="pricing-card__price">${hasDiscount ? "para " : ""}R$ ${formatPrice(finalPrice)}</span>
              <span class="pricing-card__price-suffix">${plan.priceSuffix}</span>
            </div>
            <p class="pricing-card__desc">${plan.description}</p>
            <ul class="pricing-card__features">${featuresHtml}</ul>
            <a href="${CTA_URL}" target="_blank" rel="noopener" class="btn btn--primary btn--block">${plan.ctaLabel}</a>
          </div>
        </div>`;
    }).join("");
  }

  function initPricing() {
    const section = document.querySelector("[data-pricing-section]");
    if (!section) return;
    const toggle = section.querySelector("[data-billing-toggle]");
    const track = section.querySelector("[data-carousel-track]");
    const carouselRoot = section.querySelector("[data-carousel]");
    let activeCycle = "monthly";
    let pricingCarousel = null;

    function rerender() {
      renderPricingCards(track, activeCycle);
      if (pricingCarousel) {
        pricingCarousel.refresh();
      } else {
        pricingCarousel = new Carousel(carouselRoot);
      }
    }

    function handleCycleChange(id) {
      activeCycle = id;
      renderBillingToggle(toggle, activeCycle, handleCycleChange);
      rerender();
    }

    renderBillingToggle(toggle, activeCycle, handleCycleChange);
    rerender();
  }

  function initCalcKeyboardAdjust() {
    const inputs = document.querySelectorAll("#calc .calc__inputs input");
    const container = document.querySelector("[data-snap-container]");
    if (!inputs.length || !container || !window.visualViewport) return;

    const vv = window.visualViewport;
    let activeInput = null;
    let debounceId = null;

    // Ajusta a rolagem do container único da página (em vez de dar à seção sua própria
    // área de rolagem) para trazer o campo em edição para cima do teclado virtual — assim
    // a página nunca fica com duas barras de rolagem independentes.
    function adjustForKeyboard() {
      if (!activeInput) return;
      const margin = 16;
      const visibleTop = vv.offsetTop;
      const visibleBottom = vv.height + vv.offsetTop;
      const rect = activeInput.getBoundingClientRect();

      if (rect.bottom > visibleBottom - margin) {
        container.scrollBy({ top: rect.bottom - (visibleBottom - margin), behavior: "smooth" });
      } else if (rect.top < visibleTop + margin) {
        container.scrollBy({ top: rect.top - (visibleTop + margin), behavior: "smooth" });
      }
    }

    // Vários eventos (focus + resize + scroll do visualViewport) podem disparar em sequência
    // durante a animação de abertura do teclado; sem debounce, chamadas de scrollBy("smooth")
    // se sobrepõem e brigam entre si, resultando numa correção parcial e imprecisa.
    function scheduleAdjust(delay) {
      if (debounceId) clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        debounceId = null;
        adjustForKeyboard();
      }, delay);
    }

    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        activeInput = input;
        scheduleAdjust(300);
      });
      input.addEventListener("blur", () => {
        if (activeInput === input) activeInput = null;
      });
    });

    vv.addEventListener("resize", () => scheduleAdjust(80));
    vv.addEventListener("scroll", () => scheduleAdjust(80));
  }

  function initCalcInputs() {
    const calcInputs = document.querySelectorAll("#calc .calc__inputs input");
    const highlight = document.getElementById("costHighlight");
    const defaultView = highlight ? highlight.querySelector(".cost__highlight-default") : null;
    const compareView = document.getElementById("costCompare");
    const costWithout = document.getElementById("costWithout");
    const costWith = document.getElementById("costWith");
    if (!calcInputs.length || !highlight || !defaultView || !compareView || !costWithout || !costWith) return;

    let resultVisible = false;

    calcInputs.forEach((input) => {
      input.addEventListener("input", () => {
        const [n1, n2, n3] = Array.from(calcInputs).map((el) => el.value.replace(",", "."));
        const isValid = n1 !== "" && n2 !== "" && n3 !== "" && ![n1, n2, n3].some((v) => isNaN(Number(v)));

        if (!isValid) {
          if (resultVisible) {
            resultVisible = false;
            defaultView.style.display = "";
            compareView.style.display = "none";
            compareView.setAttribute("aria-hidden", "true");
          }
          return;
        }

        const annualLoss = Number(n1) * Number(n2) * Number(n3) * 12;
        const formattedLoss = formatPrice(annualLoss);
        costWithout.textContent = `- R$ ${formattedLoss}/ano`;
        costWith.textContent = `+ R$ ${formattedLoss}/ano`;

        if (!resultVisible) {
          resultVisible = true;
          defaultView.style.display = "none";
          compareView.style.display = "flex";
          compareView.removeAttribute("aria-hidden");
          input.blur();
          waitForKeyboardClose(() => {
            highlight.scrollIntoView({ behavior: "smooth", block: "center" });
          });
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindCtaLinks();
    initScrollCue();
    initScrollAnimations();
    initSectionKeyboardNav();
    initPersistentCta();
    initPricing();
    initCarousels("[data-carousel]:not([data-pricing-carousel])");
    initCalcInputs();
    initCalcKeyboardAdjust();
  });
})();

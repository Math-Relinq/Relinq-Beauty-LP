/**
 * Configuração central da landing page.
 * Altere aqui a URL de destino de todos os CTAs da página.
 */
const CTA_URL = "https://app.relinq.com.br/cadastro";

/** Ciclos de cobrança disponíveis para os planos (desconto em %). */
const BILLING_CYCLES = [
  { id: "monthly", label: "Mensal", discount: 0 },
  { id: "quarterly", label: "Trimestral", discount: 10 },
  { id: "semiannual", label: "Semestral", discount: 15 },
  { id: "annual", label: "Anual", discount: 20 },
];

/** Dados dos planos. Edite valores, textos e recursos livremente. */
const PLANS = [
  {
    id: "free",
    name: "Gratuito",
    highlighted: false,
    badge: null,
    priceType: "fixed",
    price: 0,
    priceSuffix: "/mês",
    description: "Para tirar o salão do caderno sem gastar nada.",
    features: [
      { text: "Até 15 agendamentos por mês", included: true },
      { text: "Site próprio para agendamentos", included: true },
      { text: "Sem custo e sem cartão de crédito", included: true },
      { text: "Lembretes automáticos via WhatsApp", included: false },
      { text: "Controle de caixa e gestão financeira", included: false },
      { text: "Lista de espera, cupons e avaliações", included: false },
    ],
    ctaLabel: "Criar minha conta grátis",
  },
  {
    id: "essential",
    name: "Essential",
    highlighted: false,
    badge: null,
    priceType: "per-user",
    price: 19.9,
    priceSuffix: "/mês por usuário",
    description: "Para organizar a agenda e reduzir as faltas.",
    features: [
      { text: "Agendamentos ilimitados", included: true },
      { text: "Site próprio incluso", included: true },
      { text: "Até 50 lembretes automáticos via WhatsApp/mês", included: true },
      { text: "Controle de caixa e gestão financeira", included: false },
      { text: "Lista de espera, cupons e avaliações", included: false },
    ],
    ctaLabel: "Começar com o Essential",
  },
  {
    id: "pro",
    name: "Pro",
    highlighted: true,
    badge: "Mais popular",
    priceType: "per-user",
    price: 39.9,
    priceSuffix: "/mês por usuário",
    description: "Para quem quer o salão rodando no piloto automático.",
    features: [
      { text: "Agendamentos e lembretes via WhatsApp ilimitados", included: true },
      { text: "Controle de caixa e gestão financeira avançados", included: true },
      { text: "Lista de espera e gestão de cupons", included: true },
      { text: "Avaliações de clientes direto no painel", included: true },
      { text: "Todos os recursos habilitados", included: true },
    ],
    ctaLabel: "Começar com o Pro",
  },
];

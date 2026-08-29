/**
 * Configuração central da landing page.
 * Altere aqui a URL de destino de todos os CTAs da página.
 */
const CTA_URL = "https://app.relinq.com.br/cadastro";

/* Os PREÇOS e DESCONTOS vêm do arquivo "precos-dos-planos.js" (na raiz do
 * projeto), carregado antes deste. Os helpers abaixo leem de lá com segurança:
 * se o arquivo faltar ou tiver erro de digitação, cai nos valores padrão e o
 * site continua funcionando. Para mudar preço, edite SÓ aquele arquivo. */
const _PP = (typeof PRECOS_DOS_PLANOS !== "undefined" && PRECOS_DOS_PLANOS) || {};
function _preco(plano, campo, padrao) {
  return _PP[plano]?.[campo] != null ? _PP[plano][campo] : padrao;
}
function _desconto(ciclo, padrao) {
  return _PP.descontos?.[ciclo] != null ? _PP.descontos[ciclo] : padrao;
}

/** Ciclos de cobrança disponíveis para os planos (desconto em %). */
const BILLING_CYCLES = [
  { id: "monthly", label: "Mensal", discount: _desconto("mensal", 0) },
  { id: "quarterly", label: "Trimestral", discount: _desconto("trimestral", 10) },
  { id: "semiannual", label: "Semestral", discount: _desconto("semestral", 15) },
  { id: "annual", label: "Anual", discount: _desconto("anual", 20) },
];

/** Dados dos planos. Edite valores, textos e recursos livremente. */
const PLANS = [
  {
    id: "free",
    name: "Gratuito",
    highlighted: false,
    badge: null,
    priceType: "fixed",
    price: _preco("gratuito", "preco", 0),
    priceSuffix: _preco("gratuito", "sufixo", "/mês"),
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
    price: _preco("essential", "preco", 19.9),
    priceSuffix: _preco("essential", "sufixo", "/mês por usuário"),
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
    price: _preco("pro", "preco", 39.9),
    priceSuffix: _preco("pro", "sufixo", "/mês por usuário"),
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

/* ============================================================================
   PREÇOS DOS PLANOS  —  edite SÓ os números e textos abaixo.

   • "preco"    = valor mensal em reais. Use ponto para os centavos (ex.: 19.90).
                  Coloque 0 para o plano gratuito.
   • "sufixo"   = texto que aparece depois do preço (ex.: "/mês", "/mês por usuário").
   • "descontos"= desconto de cada ciclo de cobrança, em % (ex.: 10 = 10% OFF).
                  O "mensal" normalmente fica 0.

   Não precisa mexer em mais nada. Depois de salvar este arquivo, recarregue a
   página (Ctrl+Shift+R). Se digitar algo errado (faltar uma vírgula, aspas etc.),
   o site volta sozinho para valores padrão — é só corrigir e recarregar.
   ============================================================================ */

const PRECOS_DOS_PLANOS = {

  // ---------- Card 1: GRATUITO ----------
  gratuito: {
    preco: 0,
    sufixo: "/mês",
  },

  // ---------- Card 2: ESSENTIAL ----------
  essential: {
    preco: 24.90,
    sufixo: "/mês por usuário",
  },

  // ---------- Card 3: PRO ----------
  pro: {
    preco: 49.90,
    sufixo: "/mês por usuário",
  },

  // ---------- Descontos por ciclo de cobrança (%) ----------
  descontos: {
    mensal: 0,
    trimestral: 10,
    semestral: 15,
    anual: 20,
  },
};

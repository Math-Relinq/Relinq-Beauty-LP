/* ============================================================================
   PREÇOS DOS PLANOS  —  edite SÓ os números e textos abaixo.

   • "preco"    = valor do plano Gratuito (sempre 0, não muda por ciclo).
   • "precos"   = valor final de cada ciclo de cobrança, já com o desconto
                  aplicado. Use ponto para os centavos (ex.: 19.90).
   • "sufixo"   = texto que aparece depois do preço (ex.: "/mês", "/mês por usuário").
   • "descontos"= só o rótulo (%) mostrado no seletor de ciclo (ex.: "-10%").
                  Não precisa bater matematicamente com "precos" — é só o selo.

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
    precos: {
      mensal:     24.90,
      trimestral: 22.40,
      semestral:  21.15,
      anual:      19.90,
    },
    sufixo: "/mês por usuário",
  },

  // ---------- Card 3: PRO ----------
  pro: {
    precos: {
      mensal:     49.90,
      trimestral: 44.90,
      semestral:  42.40,
      anual:      39.90,
    },
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

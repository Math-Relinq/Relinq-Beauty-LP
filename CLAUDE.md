## Fluxo obrigatório ao concluir uma alteração
1. **Revisar e confirmar**: valide que o bug foi corrigido ou a implementação funcionou.
2. **Checar regressões**: revise com prints, garanta que nada além do solicitado foi alterado/quebrado. Se algo mudou indevidamente, corrija e reteste antes de finalizar.
3. **Responsividade**: toda alteração visual deve funcionar bem em todos os tamanhos de tela (especialmente mobile) — testar com prints em diferentes resoluções.
4. **Log**: salvar o registro em `logs/<Mês (NN)>/Dia <DD>/` — mês por extenso em português com inicial maiúscula e o número do mês entre parênteses (ex.: `Agosto (08)`), e a pasta do dia com o prefixo `Dia ` seguido do número (ex.: `Dia 26`). Criar as pastas que faltarem. O arquivo deve se chamar `HH:MM-descricao-curta.txt` (hora em 24h, descrição enxuta em kebab-case) e resumir o que foi alterado. Exemplo: `logs/Agosto (08)/Dia 26/14:30-clarear-cores.txt`.

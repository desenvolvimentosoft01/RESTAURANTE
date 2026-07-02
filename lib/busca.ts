// Busca padrão ERP: se o termo contém "%", vira um LIKE de verdade
// (%coca%cola%1%litro% → precisa conter "coca", depois "cola", depois "1",
// depois "litro", nessa ordem, em qualquer lugar do texto). Sem "%", vira
// busca simples "contém o termo em qualquer lugar" (equivalente a %termo%).
export function correspondeLike(texto: string | null | undefined, termo: string): boolean {
  const alvo = (texto ?? '').toLocaleLowerCase('pt-BR')
  const padrao = termo.trim().toLocaleLowerCase('pt-BR')
  if (!padrao) return true

  if (!padrao.includes('%')) {
    return alvo.includes(padrao)
  }

  const escapado = padrao
    .split('%')
    .map((parte) => parte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*')
  const regex = new RegExp(escapado, 's')
  return regex.test(alvo)
}

// Tri-estado usado nos filtros de busca (Switch do cadastro é binário,
// mas na pesquisa precisa existir a opção "não filtrar por este campo").
export type FiltroTriState = 'todos' | 'sim' | 'nao'

export function correspondeTriState(valor: boolean, filtro: FiltroTriState): boolean {
  if (filtro === 'todos') return true
  return filtro === 'sim' ? valor === true : valor === false
}

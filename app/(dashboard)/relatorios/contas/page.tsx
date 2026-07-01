import { createClient } from '@/lib/supabase/server'
import { RelatoriosContasConteudo } from '@/components/relatorios/RelatoriosContasConteudo'

interface PageProps {
  searchParams: Promise<{
    inicio?: string; fim?: string
    tipo?: string; status?: string; categoria?: string
  }>
}

export default async function RelatoriosContasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const hoje = new Date()
  const inicioDefault = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
  const fimDefault    = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
  const inicioPeriodo = params.inicio   ?? inicioDefault
  const fimPeriodo    = params.fim      ?? fimDefault
  const filtroTipo    = params.tipo     ?? 'todos'
  const filtroStatus  = params.status   ?? 'todos'
  const filtroCateg   = params.categoria ?? 'todos'

  let query = supabase
    .from('contas')
    .select('*')
    .gte('vencimento', inicioPeriodo)
    .lte('vencimento', fimPeriodo)
    .order('vencimento')

  if (filtroTipo !== 'todos')   query = query.eq('tipo', filtroTipo)
  if (filtroStatus === 'pago')  query = query.eq('pago', true)
  if (filtroStatus === 'pendente') query = query.eq('pago', false)
  if (filtroCateg !== 'todos')  query = query.eq('categoria', filtroCateg)

  const { data: contas } = await query

  // Buscar categorias distintas para o filtro
  const { data: todasContas } = await supabase.from('contas').select('categoria')
  const categorias = [...new Set(
    (todasContas ?? []).map((c) => c.categoria).filter(Boolean)
  )].sort() as string[]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Relatório de Contas</h1>
        <p className="text-xs text-slate-500 mt-0.5">Contas a pagar e receber por período com filtros avançados</p>
      </div>
      <RelatoriosContasConteudo
        contas={contas ?? []}
        categorias={categorias}
        inicioPeriodo={inicioPeriodo}
        fimPeriodo={fimPeriodo}
        filtros={{ tipo: filtroTipo, status: filtroStatus, categoria: filtroCateg }}
      />
    </div>
  )
}

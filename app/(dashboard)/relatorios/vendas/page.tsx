import { createClient } from '@/lib/supabase/server'
import { RelatoriosVendasConteudo } from '@/components/relatorios/RelatoriosVendasConteudo'

interface PageProps {
  searchParams: Promise<{ inicio?: string; fim?: string }>
}

export default async function RelatoriosVendasPage({ searchParams }: PageProps) {
  const { inicio, fim } = await searchParams
  const supabase = await createClient()

  const hoje = new Date()
  const inicioDefault = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
  const fimDefault    = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
  const inicioPeriodo = inicio ?? inicioDefault
  const fimPeriodo    = fim    ?? fimDefault
  const inicioTs = `${inicioPeriodo}T00:00:00`
  const fimTs    = `${fimPeriodo}T23:59:59`

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('*, itens:itens_pedido(nome_produto, quantidade, subtotal, preco_unitario)')
    .gte('created_at', inicioTs)
    .lte('created_at', fimTs)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Relatório de Vendas</h1>
        <p className="text-xs text-slate-500 mt-0.5">Análise completa de pedidos e faturamento por período</p>
      </div>
      <RelatoriosVendasConteudo
        pedidos={pedidos ?? []}
        inicioPeriodo={inicioPeriodo}
        fimPeriodo={fimPeriodo}
      />
    </div>
  )
}

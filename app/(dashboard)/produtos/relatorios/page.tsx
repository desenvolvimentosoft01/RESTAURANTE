import { createClient } from '@/lib/supabase/server'
import { RelatoriosProdutosConteudo } from '@/components/produtos/RelatoriosProdutosConteudo'

interface PageProps {
  searchParams: Promise<{ inicio?: string; fim?: string }>
}

export default async function RelatoriosProdutosPage({ searchParams }: PageProps) {
  const { inicio, fim } = await searchParams
  const supabase = await createClient()

  // Período padrão: mês atual
  const hoje = new Date()
  const inicioDefault = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
  const fimDefault    = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]

  const inicioPeriodo = inicio ?? inicioDefault
  const fimPeriodo    = fim    ?? fimDefault

  // Timestamps completos do período
  const inicioTs = `${inicioPeriodo}T00:00:00`
  const fimTs    = `${fimPeriodo}T23:59:59`

  const [
    { data: itensPeriodo },
    { data: pedidosPeriodo },
    { data: estoque },
    { data: categorias },
  ] = await Promise.all([
    // Itens vendidos no período (excluindo cancelados)
    supabase
      .from('itens_pedido')
      .select('produto_id, nome_produto, quantidade, subtotal, preco_unitario, pedido:pedidos!inner(created_at, status, origem)')
      .gte('pedido.created_at', inicioTs)
      .lte('pedido.created_at', fimTs)
      .neq('pedido.status', 'cancelado'),

    // Pedidos do período para totais
    supabase
      .from('pedidos')
      .select('id, total, origem, status, created_at')
      .gte('created_at', inicioTs)
      .lte('created_at', fimTs)
      .neq('status', 'cancelado'),

    // Estoque atual dos produtos com controle
    supabase
      .from('produtos')
      .select('id, nome, estoque_atual, estoque_minimo, controla_estoque, categoria:categorias!inner(nome)')
      .eq('controla_estoque', true)
      .order('nome'),

    // Categorias para agrupamento
    supabase.from('categorias').select('id, nome').order('nome'),
  ])

  // Agrega vendas por produto
  const vendasPorProduto = Object.values(
    (itensPeriodo ?? []).reduce<Record<string, {
      produto_id: string | null
      nome_produto: string
      total_quantidade: number
      total_receita: number
      preco_unitario: number
    }>>((acc, item) => {
      const key = item.produto_id ?? item.nome_produto
      if (!acc[key]) {
        acc[key] = {
          produto_id: item.produto_id,
          nome_produto: item.nome_produto,
          total_quantidade: 0,
          total_receita: 0,
          preco_unitario: item.preco_unitario,
        }
      }
      acc[key].total_quantidade += item.quantidade
      acc[key].total_receita += item.subtotal
      return acc
    }, {})
  ).sort((a, b) => b.total_quantidade - a.total_quantidade)

  // Totais gerais
  const totalPedidos  = pedidosPeriodo?.length ?? 0
  const totalReceita  = pedidosPeriodo?.reduce((s, p) => s + p.total, 0) ?? 0
  const totalItens    = (itensPeriodo ?? []).reduce((s, i) => s + i.quantidade, 0)
  const ticketMedio   = totalPedidos > 0 ? totalReceita / totalPedidos : 0
  const pedidosIfood  = pedidosPeriodo?.filter((p) => p.origem === 'ifood').length ?? 0
  const pedidosBalcao = pedidosPeriodo?.filter((p) => p.origem === 'balcao').length ?? 0

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Relatório de Produtos</h1>
        <p className="text-xs text-slate-500 mt-0.5">Análise de vendas, desempenho e estoque</p>
      </div>

      <RelatoriosProdutosConteudo
        vendasPorProduto={vendasPorProduto}
        estoque={(estoque ?? []).map(e => ({ ...e, categoria: Array.isArray(e.categoria) ? e.categoria[0] ?? null : e.categoria }))}
        categorias={categorias ?? []}
        inicioPeriodo={inicioPeriodo}
        fimPeriodo={fimPeriodo}
        totais={{ totalPedidos, totalReceita, totalItens, ticketMedio, pedidosIfood, pedidosBalcao }}
      />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { RelatoriosFinanceirosConteudo } from '@/components/financeiro/RelatoriosFinanceirosConteudo'

export default async function RelatoriosFinanceirosPage() {
  const supabase = await createClient()

  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]

  const [{ data: transacoes }, { data: contas }, { data: topProdutos }] = await Promise.all([
    supabase.from('transacoes').select('*').gte('data_competencia', inicioMes).lte('data_competencia', fimMes).order('data_competencia'),
    supabase.from('contas').select('*').order('vencimento'),
    supabase.from('produtos_mais_vendidos').select('*').limit(10),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Relatórios Financeiros</h1>
      <RelatoriosFinanceirosConteudo
        transacoes={transacoes ?? []}
        contas={contas ?? []}
        topProdutos={topProdutos ?? []}
        inicioMes={inicioMes}
        fimMes={fimMes}
      />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { EstoqueConteudo } from '@/components/produtos/EstoqueConteudo'

export default async function EstoqueProdutosPage() {
  const supabase = await createClient()

  const { data: produtos } = await supabase
    .from('produtos')
    .select('id, nome, estoque_atual, estoque_minimo, controla_estoque, ativo, unidade_venda')
    .eq('controla_estoque', true)
    .order('nome')

  const { data: movimentacoes } = await supabase
    .from('movimentacoes_estoque_produto')
    .select('*, produto:produtos(nome, unidade_venda)')
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Estoque</h1>
        <p className="text-sm text-slate-500 mt-0.5">Produtos com controle de estoque ativado</p>
      </div>

      <EstoqueConteudo produtos={produtos ?? []} movimentacoes={movimentacoes ?? []} />
    </div>
  )
}

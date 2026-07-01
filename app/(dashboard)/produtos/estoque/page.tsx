import { Package2 } from 'lucide-react'

import { formatarDataCurta } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { AjusteEstoqueBtn } from '@/components/produtos/AjusteEstoqueBtn'
import { Badge } from '@/components/ui/badge'

export default async function EstoqueProdutosPage() {
  const supabase = await createClient()

  const { data: produtos } = await supabase
    .from('produtos')
    .select('id, nome, estoque_atual, estoque_minimo, controla_estoque, ativo')
    .eq('controla_estoque', true)
    .order('nome')

  const { data: movimentacoes } = await supabase
    .from('movimentacoes_estoque_produto')
    .select('*, produto:produtos(nome)')
    .order('created_at', { ascending: false })
    .limit(30)

  const semEstoque = produtos?.filter((p) => !p.controla_estoque) ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Estoque</h1>
        <p className="text-sm text-slate-500 mt-0.5">Produtos com controle de estoque ativado</p>
      </div>

      {!produtos?.length ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <Package2 size={48} className="text-slate-200" />
          <div>
            <p className="font-medium text-slate-600">Nenhum produto com controle de estoque</p>
            <p className="text-sm text-slate-400 mt-1">
              Ative o &quot;Controle de Estoque&quot; no cadastro de cada produto
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Produto</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estoque Atual</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mínimo</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Situação</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ajuste</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produtos.map((p) => {
                const alerta = p.estoque_atual <= p.estoque_minimo
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800 text-sm">{p.nome}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-lg font-bold ${alerta ? 'text-red-600' : 'text-slate-800'}`}>
                        {p.estoque_atual}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-sm text-slate-500">{p.estoque_minimo}</td>
                    <td className="px-5 py-4 text-center">
                      {alerta ? (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">⚠️ Baixo</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">OK</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <AjusteEstoqueBtn produtoId={p.id} nomeProduto={p.nome} estoqueAtual={p.estoque_atual} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!!movimentacoes?.length && (
        <div className="space-y-3">
          <h2 className="font-semibold text-slate-700">Últimas movimentações</h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Produto</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Qtd.</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movimentacoes.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-xs text-slate-400">{formatarDataCurta(m.created_at)}</td>
                    <td className="px-5 py-3 text-sm text-slate-700">{(m.produto as { nome: string } | null)?.nome ?? '—'}</td>
                    <td className="px-5 py-3 text-center">
                      <Badge
                        className={
                          m.tipo === 'entrada' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                          m.tipo === 'saida'   ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                                 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                        }
                      >
                        {m.tipo === 'entrada' ? 'Entrada' : m.tipo === 'saida' ? 'Saída' : 'Ajuste'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-center font-semibold text-slate-800">{m.quantidade}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{m.motivo ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

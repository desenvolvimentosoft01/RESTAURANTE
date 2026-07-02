import { PackageX } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { ReativarProdutoBtn } from '@/components/produtos/ReativarProdutoBtn'
import { BotaoImprimir } from '@/components/ui/BotaoImprimir'

export default async function ProdutosInativosPage() {
  const supabase = await createClient()

  const { data: produtos } = await supabase
    .from('produtos')
    .select('id, nome, preco, unidade_venda, categoria:categorias(nome)')
    .eq('ativo', false)
    .order('nome')

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Produtos Inativos</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Produtos tirados do mix da loja — inclui os que não puderam ser excluídos por já terem movimentação/venda
          </p>
        </div>
        <BotaoImprimir />
      </div>

      {!produtos?.length ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <PackageX size={48} className="text-slate-200" />
          <p className="text-sm text-slate-400">Nenhum produto inativo no momento</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Produto</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Categoria</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Preço</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produtos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-slate-800">{p.nome}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">
                    {(Array.isArray(p.categoria) ? p.categoria[0] : p.categoria)?.nome ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-semibold text-slate-700">
                    {p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/{p.unidade_venda}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <ReativarProdutoBtn id={p.id} nome={p.nome} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

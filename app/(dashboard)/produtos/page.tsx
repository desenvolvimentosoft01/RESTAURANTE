import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil, Package } from 'lucide-react'
import { formatarMoeda } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeletarProdutoBtn } from '@/components/produtos/DeletarProdutoBtn'

export default async function ProdutosPage() {
  const supabase = await createClient()

  const { data: produtos } = await supabase
    .from('produtos')
    .select('*, categoria:categorias(id,nome)')
    .order('nome')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{produtos?.length ?? 0} produtos cadastrados</p>
        </div>
        <Button asChild>
          <Link href="/produtos/novo">
            <Plus size={16} className="mr-2" />
            Novo Produto
          </Link>
        </Button>
      </div>

      {!produtos?.length ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <Package size={48} className="text-slate-200" />
          <div>
            <p className="font-medium text-slate-600">Nenhum produto cadastrado</p>
            <p className="text-sm text-slate-400 mt-1">Clique em "Novo Produto" para começar</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Produto</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Categoria</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Preço</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estoque</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produtos.map((produto) => {
                const estoqueAlerta = produto.controla_estoque && produto.estoque_atual <= produto.estoque_minimo
                return (
                  <tr key={produto.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{produto.nome}</p>
                        {produto.descricao && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{produto.descricao}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">{(produto.categoria as { nome: string } | null)?.nome ?? '—'}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-semibold text-slate-800">{formatarMoeda(produto.preco)}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {produto.controla_estoque ? (
                        <span className={`text-sm font-medium ${estoqueAlerta ? 'text-red-600' : 'text-slate-700'}`}>
                          {produto.estoque_atual}
                          {estoqueAlerta && <span className="ml-1 text-xs">⚠️</span>}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge
                        variant={produto.ativo ? 'default' : 'secondary'}
                        className={produto.ativo ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                      >
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/produtos/${produto.id}/editar`}>
                            <Pencil size={14} />
                          </Link>
                        </Button>
                        <DeletarProdutoBtn id={produto.id} nome={produto.nome} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

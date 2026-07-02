'use client'

import { useCallback, useMemo, useState } from 'react'

import { Package2, Search } from 'lucide-react'
import { toast } from 'sonner'

import { correspondeLike } from '@/lib/busca'
import { formatarDataCurta } from '@/lib/utils'
import { AjusteEstoqueBtn } from './AjusteEstoqueBtn'
import { Badge } from '@/components/ui/badge'
import { BotaoImprimir } from '@/components/ui/BotaoImprimir'
import { Input } from '@/components/ui/input'
import type { UnidadeMedida } from '@/types/database'

interface ProdutoEstoque {
  id: string
  nome: string
  estoque_atual: number
  estoque_minimo: number
  controla_estoque: boolean
  ativo: boolean
  unidade_venda: UnidadeMedida
}

interface Movimentacao {
  id: string
  created_at: string
  tipo: 'entrada' | 'saida' | 'ajuste'
  quantidade: number
  motivo: string | null
  produto: { nome: string; unidade_venda: string } | { nome: string; unidade_venda: string }[] | null
}

interface Props {
  produtos: ProdutoEstoque[]
  movimentacoes: Movimentacao[]
}

export function EstoqueConteudo({ produtos, movimentacoes }: Props) {
  const [texto, setTexto] = useState('')
  const [textoAplicado, setTextoAplicado] = useState('')

  const aplicarFiltro = useCallback((termo: string) => {
    return produtos.filter((p) => correspondeLike(p.nome, termo))
  }, [produtos])

  const produtosFiltrados = useMemo(() => aplicarFiltro(textoAplicado), [aplicarFiltro, textoAplicado])

  function pesquisar() {
    setTextoAplicado(texto)
    if (!aplicarFiltro(texto).length) {
      toast.warning('Nenhum registro encontrado para os filtros informados.')
    }
  }
  function limparBusca() { setTexto(''); setTextoAplicado('') }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end gap-3 print:hidden">
        <div className="relative max-w-sm flex-1 min-w-55">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Pesquisar produto..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && pesquisar()}
            className="pl-9 h-9"
          />
        </div>
        <button
          onClick={pesquisar}
          className="h-9 flex items-center gap-1.5 px-4 text-xs font-bold text-white bg-slate-800 rounded-md hover:bg-slate-700 transition-colors"
        >
          <Search size={13} />
          Pesquisar
        </button>
        <button
          onClick={limparBusca}
          className="h-9 px-3 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          Limpar
        </button>
        <BotaoImprimir />
        {textoAplicado && (
          <span className="text-xs font-semibold text-slate-600 bg-slate-200 px-3 py-2 rounded-md">
            {produtosFiltrados.length} registro(s) encontrado(s)
          </span>
        )}
      </div>

      {!produtosFiltrados.length ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <Package2 size={48} className="text-slate-200" />
          <div>
            <p className="font-medium text-slate-600">
              {produtos.length ? 'Nenhum registro encontrado para os filtros informados.' : 'Nenhum produto com controle de estoque'}
            </p>
            {!produtos.length && (
              <p className="text-sm text-slate-400 mt-1">
                Ative o &quot;Controle de Estoque&quot; no cadastro de cada produto
              </p>
            )}
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
              {produtosFiltrados.map((p) => {
                const alerta = p.estoque_atual <= p.estoque_minimo
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800 text-sm">{p.nome}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-lg font-bold ${alerta ? 'text-red-600' : 'text-slate-800'}`}>
                        {p.estoque_atual} {p.unidade_venda}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-sm text-slate-500">{p.estoque_minimo} {p.unidade_venda}</td>
                    <td className="px-5 py-4 text-center">
                      {alerta ? (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">⚠️ Baixo</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">OK</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <AjusteEstoqueBtn produtoId={p.id} nomeProduto={p.nome} estoqueAtual={p.estoque_atual} unidadeMedida={p.unidade_venda} />
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
                {movimentacoes.map((m) => {
                  const produto = Array.isArray(m.produto) ? m.produto[0] : m.produto
                  return (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 text-xs text-slate-400">{formatarDataCurta(m.created_at)}</td>
                      <td className="px-5 py-3 text-sm text-slate-700">{produto?.nome ?? '—'}</td>
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
                      <td className="px-5 py-3 text-center font-semibold text-slate-800">
                        {m.quantidade} {produto?.unidade_venda ?? ''}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500">{m.motivo ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { formatarMoeda } from '@/lib/utils'
import { useCarrinho } from '@/hooks/useCarrinho'
import { Minus, Plus, X, ShoppingCart } from 'lucide-react'

interface Props {
  onFinalizar: () => void
}

export function CarrinhoVenda({ onFinalizar }: Props) {
  const itens = useCarrinho((s) => s.itens)
  const alterarQuantidade = useCarrinho((s) => s.alterarQuantidade)
  const removerItem = useCarrinho((s) => s.removerItem)
  const total = useCarrinho((s) => s.total)
  const limpar = useCarrinho((s) => s.limpar)

  if (itens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
        <ShoppingCart size={40} strokeWidth={1} />
        <p className="text-sm text-center">Clique em um produto para adicionar ao pedido</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {itens.map((item) => (
          <div key={item.produto.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{item.produto.nome}</p>
              <p className="text-xs text-slate-400 mt-0.5">{formatarMoeda(item.produto.preco)} un.</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="w-6 h-6 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 flex items-center justify-center transition-colors font-bold text-xs"
                onClick={() => alterarQuantidade(item.produto.id, item.quantidade - 1)}
              >
                <Minus size={11} />
              </button>
              <span className="w-7 text-center text-sm font-bold text-slate-800">{item.quantidade}</span>
              <button
                className="w-6 h-6 rounded bg-slate-700 text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
                onClick={() => alterarQuantidade(item.produto.id, item.quantidade + 1)}
              >
                <Plus size={11} />
              </button>
            </div>
            <p className="text-sm font-bold w-16 text-right text-slate-800">
              {formatarMoeda(item.produto.preco * item.quantidade)}
            </p>
            <button
              onClick={() => removerItem(item.produto.id)}
              className="w-5 h-5 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-600 text-sm">Total do pedido</span>
          <span className="text-2xl font-bold text-slate-900">{formatarMoeda(total())}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={limpar}
            className="flex-1 py-2 px-3 text-sm font-semibold text-slate-600 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Limpar
          </button>
          <button
            onClick={onFinalizar}
            className="flex-2 py-2 px-3 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  )
}

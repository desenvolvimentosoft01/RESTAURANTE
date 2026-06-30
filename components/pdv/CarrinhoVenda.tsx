'use client'

import { formatarMoeda } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCarrinho } from '@/hooks/useCarrinho'

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
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
        <span className="text-4xl">🛒</span>
        <p className="text-sm">Clique em um produto para adicionar</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2">
        {itens.map((item) => (
          <div key={item.produto.id} className="flex items-center gap-2 p-2 rounded-md border bg-white">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{item.produto.nome}</p>
              <p className="text-xs text-slate-500">{formatarMoeda(item.produto.preco)} cada</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0"
                onClick={() => alterarQuantidade(item.produto.id, item.quantidade - 1)}
              >
                −
              </Button>
              <span className="w-6 text-center text-sm font-semibold">{item.quantidade}</span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0"
                onClick={() => alterarQuantidade(item.produto.id, item.quantidade + 1)}
              >
                +
              </Button>
            </div>
            <p className="text-sm font-semibold w-16 text-right">
              {formatarMoeda(item.produto.preco * item.quantidade)}
            </p>
            <button
              onClick={() => removerItem(item.produto.id)}
              className="text-slate-400 hover:text-red-500 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <Separator />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-800">Total</span>
          <span className="text-xl font-bold text-slate-900">{formatarMoeda(total())}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={limpar}>
            Limpar
          </Button>
          <Button className="flex-1" onClick={onFinalizar}>
            Finalizar
          </Button>
        </div>
      </div>
    </div>
  )
}

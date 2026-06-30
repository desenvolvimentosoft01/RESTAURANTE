'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { formatarMoeda } from '@/lib/utils'
import { useCarrinho } from '@/hooks/useCarrinho'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { FormaPagamento } from '@/types/database'

const FORMAS_PAGAMENTO: { valor: FormaPagamento; label: string }[] = [
  { valor: 'dinheiro', label: 'Dinheiro' },
  { valor: 'pix', label: 'Pix' },
  { valor: 'debito', label: 'Débito' },
  { valor: 'credito', label: 'Crédito' },
]

interface Props {
  aberto: boolean
  onFechar: () => void
}

export function ModalPagamento({ aberto, onFechar }: Props) {
  const router = useRouter()
  const itens = useCarrinho((s) => s.itens)
  const total = useCarrinho((s) => s.total)
  const limpar = useCarrinho((s) => s.limpar)

  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('dinheiro')
  const [nomeCliente, setNomeCliente] = useState('')
  const [finalizando, setFinalizando] = useState(false)

  async function finalizar() {
    if (itens.length === 0) return
    setFinalizando(true)

    try {
      const supabase = createClient()
      const subtotal = total()

      const { data: pedido, error: errPedido } = await supabase
        .from('pedidos')
        .insert({
          origem: 'balcao',
          status: 'confirmado',
          forma_pagamento: formaPagamento,
          nome_cliente: nomeCliente || null,
          subtotal,
          desconto: 0,
          total: subtotal,
        })
        .select()
        .single()

      if (errPedido) throw errPedido

      const itensPedido = itens.map((item) => ({
        pedido_id: pedido.id,
        produto_id: item.produto.id,
        nome_produto: item.produto.nome,
        preco_unitario: item.produto.preco,
        quantidade: item.quantidade,
        observacao: item.observacao || null,
        subtotal: item.produto.preco * item.quantidade,
      }))

      const { error: errItens } = await supabase.from('itens_pedido').insert(itensPedido)
      if (errItens) throw errItens

      await supabase.rpc('baixar_estoque_venda', { pedido_id: pedido.id })

      await supabase.from('transacoes').insert({
        tipo: 'entrada',
        categoria: 'venda',
        descricao: `Venda balcão${nomeCliente ? ` — ${nomeCliente}` : ''}`,
        valor: subtotal,
        data_competencia: new Date().toISOString().split('T')[0],
        pedido_id: pedido.id,
      })

      toast.success('Venda finalizada com sucesso!')
      limpar()
      setNomeCliente('')
      setFormaPagamento('dinheiro')
      onFechar()
      router.refresh()
    } catch {
      toast.error('Erro ao finalizar venda')
    } finally {
      setFinalizando(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar venda</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Forma de pagamento</Label>
            <div className="grid grid-cols-2 gap-2">
              {FORMAS_PAGAMENTO.map((fp) => (
                <button
                  key={fp.valor}
                  onClick={() => setFormaPagamento(fp.valor)}
                  className={`py-2 rounded-md border text-sm font-medium transition-colors ${
                    formaPagamento === fp.valor
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {fp.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeCliente">Nome do cliente (opcional)</Label>
            <Input
              id="nomeCliente"
              placeholder="Ex: João"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">{formatarMoeda(total())}</span>
          </div>

          <Button className="w-full" disabled={finalizando} onClick={finalizar}>
            {finalizando ? 'Finalizando...' : 'Confirmar venda'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

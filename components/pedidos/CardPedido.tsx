'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Clock, ChevronRight, Store, Bike } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatarMoeda } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Pedido, StatusPedido } from '@/types/database'

const STATUS_CONFIG: Record<StatusPedido, { label: string; cor: string }> = {
  pendente:   { label: 'Pendente',   cor: 'bg-amber-100 text-amber-700 border-amber-200' },
  confirmado: { label: 'Confirmado', cor: 'bg-blue-100 text-blue-700 border-blue-200' },
  em_preparo: { label: 'Em preparo', cor: 'bg-orange-100 text-orange-700 border-orange-200' },
  pronto:     { label: 'Pronto',     cor: 'bg-green-100 text-green-700 border-green-200' },
  entregue:   { label: 'Entregue',   cor: 'bg-slate-100 text-slate-600 border-slate-200' },
  cancelado:  { label: 'Cancelado',  cor: 'bg-red-100 text-red-700 border-red-200' },
}

const PROXIMOS_STATUS: Partial<Record<StatusPedido, StatusPedido>> = {
  pendente:   'confirmado',
  confirmado: 'em_preparo',
  em_preparo: 'pronto',
  pronto:     'entregue',
}

const LABEL_PROXIMO: Partial<Record<StatusPedido, string>> = {
  pendente:   'Confirmar',
  confirmado: 'Iniciar preparo',
  em_preparo: 'Marcar como pronto',
  pronto:     'Entregar',
}

interface Props {
  pedido: Pedido
}

export function CardPedido({ pedido }: Props) {
  const [atualizando, setAtualizando] = useState(false)

  const config = STATUS_CONFIG[pedido.status]
  const proximoStatus = PROXIMOS_STATUS[pedido.status]
  const labelProximo = LABEL_PROXIMO[pedido.status]

  async function avancarStatus() {
    if (!proximoStatus) return
    setAtualizando(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('pedidos')
        .update({ status: proximoStatus })
        .eq('id', pedido.id)
      if (error) throw error
      toast.success(`Pedido marcado como "${STATUS_CONFIG[proximoStatus].label}"`)
    } catch {
      toast.error('Erro ao atualizar status')
    } finally {
      setAtualizando(false)
    }
  }

  async function cancelar() {
    if (!confirm('Cancelar este pedido?')) return
    setAtualizando(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('pedidos')
        .update({ status: 'cancelado' })
        .eq('id', pedido.id)
      if (error) throw error
      toast.success('Pedido cancelado')
    } catch {
      toast.error('Erro ao cancelar pedido')
    } finally {
      setAtualizando(false)
    }
  }

  const tempoDecorrido = formatDistanceToNow(new Date(pedido.created_at), {
    locale: ptBR,
    addSuffix: true,
  })

  const totalItens = pedido.itens?.reduce((s, i) => s + i.quantidade, 0) ?? 0

  return (
    <Card className="overflow-hidden">
      <div className={`h-1 w-full ${pedido.status === 'pendente' ? 'bg-amber-400' : pedido.status === 'em_preparo' ? 'bg-orange-400' : pedido.status === 'pronto' ? 'bg-green-400' : pedido.status === 'cancelado' ? 'bg-red-400' : 'bg-slate-300'}`} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {pedido.origem === 'ifood' ? (
              <div className="p-1.5 bg-red-50 rounded-lg">
                <Bike size={16} className="text-red-500" />
              </div>
            ) : (
              <div className="p-1.5 bg-slate-100 rounded-lg">
                <Store size={16} className="text-slate-600" />
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-800 text-sm">
                {pedido.nome_cliente ?? (pedido.origem === 'ifood' ? 'iFood' : 'Balcão')}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock size={11} className="text-slate-400" />
                <span className="text-xs text-slate-400">{tempoDecorrido}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${config.cor}`}>
              {config.label}
            </span>
            <p className="font-bold text-slate-900 text-base mt-1">{formatarMoeda(pedido.total)}</p>
          </div>
        </div>

        {pedido.itens && pedido.itens.length > 0 && (
          <div className="mt-3 pt-3 border-t space-y-1">
            {pedido.itens.slice(0, 3).map((item) => (
              <div key={item.id} className="flex justify-between text-xs text-slate-600">
                <span>{item.quantidade}× {item.nome_produto}</span>
                <span>{formatarMoeda(item.subtotal)}</span>
              </div>
            ))}
            {pedido.itens.length > 3 && (
              <p className="text-xs text-slate-400">+{pedido.itens.length - 3} itens</p>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          {proximoStatus && pedido.status !== 'entregue' && pedido.status !== 'cancelado' && (
            <Button size="sm" className="flex-1 text-xs" disabled={atualizando} onClick={avancarStatus}>
              {atualizando ? 'Atualizando...' : labelProximo}
            </Button>
          )}
          {pedido.status !== 'entregue' && pedido.status !== 'cancelado' && (
            <Button size="sm" variant="outline" className="text-xs text-red-600 border-red-200 hover:bg-red-50" disabled={atualizando} onClick={cancelar}>
              Cancelar
            </Button>
          )}
          <Link href={`/pedidos/${pedido.id}`} className="ml-auto">
            <Button size="sm" variant="ghost" className="text-xs gap-1">
              Ver <ChevronRight size={13} />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

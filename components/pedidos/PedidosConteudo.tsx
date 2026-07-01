'use client'

import { useEffect, useRef } from 'react'

import { Bike } from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { usePedidosRealtime } from '@/hooks/usePedidosRealtime'
import { CardPedido } from './CardPedido'
import type { Pedido, StatusPedido } from '@/types/database'

const ABAS: { valor: StatusPedido | 'todos'; label: string }[] = [
  { valor: 'todos',     label: 'Todos' },
  { valor: 'pendente',  label: 'Pendentes' },
  { valor: 'em_preparo', label: 'Em preparo' },
  { valor: 'pronto',   label: 'Prontos' },
  { valor: 'entregue', label: 'Entregues' },
]

interface Props {
  inicial: Pedido[]
  filtro: StatusPedido | 'todos'
  onFiltro: (f: StatusPedido | 'todos') => void
}

export function PedidosConteudo({ inicial, filtro, onFiltro }: Props) {
  const pedidos = usePedidosRealtime(inicial)
  const contadorRef = useRef(pedidos.length)

  useEffect(() => {
    const novos = pedidos.filter(
      (p) => p.origem === 'ifood' && p.status === 'pendente'
    )

    if (pedidos.length > contadorRef.current) {
      const novosPedidos = pedidos.slice(0, pedidos.length - contadorRef.current)
      novosPedidos.forEach((p) => {
        if (p.origem === 'ifood') {
          toast('🛵 Novo pedido do iFood!', {
            description: `${p.nome_cliente ?? 'Cliente'} — ${p.itens?.length ?? 0} itens`,
            duration: 8000,
            icon: <Bike size={16} className="text-red-500" />,
          })
        }
      })
    }
    contadorRef.current = pedidos.length
  }, [pedidos])

  const pedidosFiltrados = filtro === 'todos'
    ? pedidos
    : pedidos.filter((p) => p.status === filtro)

  const contagemPorStatus = (status: StatusPedido | 'todos') =>
    status === 'todos'
      ? pedidos.length
      : pedidos.filter((p) => p.status === status).length

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {ABAS.map((aba) => {
          const count = contagemPorStatus(aba.valor)
          const ativo = filtro === aba.valor
          return (
            <button
              key={aba.valor}
              onClick={() => onFiltro(aba.valor)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                ativo
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border text-slate-600 hover:bg-slate-50'
              }`}
            >
              {aba.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${ativo ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-sm">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pedidosFiltrados.map((pedido) => (
            <CardPedido key={pedido.id} pedido={pedido} />
          ))}
        </div>
      )}
    </div>
  )
}

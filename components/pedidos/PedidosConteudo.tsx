'use client'

import { useEffect, useRef, useState } from 'react'

import { Bike, Search } from 'lucide-react'
import { toast } from 'sonner'

import { correspondeLike } from '@/lib/busca'
import { createClient } from '@/lib/supabase/client'
import { usePedidosRealtime } from '@/hooks/usePedidosRealtime'
import { Input } from '@/components/ui/input'
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
  const [texto, setTexto] = useState('')
  const [textoAplicado, setTextoAplicado] = useState('')

  function pesquisar() { setTextoAplicado(texto) }
  function limparBusca() { setTexto(''); setTextoAplicado('') }

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

  const pedidosFiltrados = pedidos
    .filter((p) => filtro === 'todos' || p.status === filtro)
    .filter((p) =>
      correspondeLike(p.nome_cliente, textoAplicado) ||
      correspondeLike(p.entregador, textoAplicado) ||
      (p.itens ?? []).some((i) => correspondeLike(i.nome_produto, textoAplicado))
    )

  const contagemPorStatus = (status: StatusPedido | 'todos') =>
    status === 'todos'
      ? pedidos.length
      : pedidos.filter((p) => p.status === status).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative max-w-sm flex-1 min-w-55">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Pesquisar por cliente, entregador ou produto..."
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
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
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
        <span className="text-xs font-semibold text-slate-600 bg-slate-200 px-3 py-1.5 rounded-md">
          {pedidosFiltrados.length} registro(s) encontrado(s)
        </span>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-sm">Nenhum registro encontrado.</p>
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

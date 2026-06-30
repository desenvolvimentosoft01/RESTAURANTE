'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Pedido } from '@/types/database'

export function usePedidosRealtime(inicial: Pedido[] = []) {
  const [pedidos, setPedidos] = useState<Pedido[]>(inicial)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('pedidos-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        (payload) => {
          setPedidos((prev) => [payload.new as Pedido, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pedidos' },
        (payload) => {
          setPedidos((prev) =>
            prev.map((p) => (p.id === payload.new.id ? (payload.new as Pedido) : p))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return pedidos
}

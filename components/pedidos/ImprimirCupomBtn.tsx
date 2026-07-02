'use client'

import { Printer } from 'lucide-react'

import { imprimirCupom } from '@/lib/cupom'
import { Button } from '@/components/ui/button'
import type { ItemPedido, Pedido } from '@/types/database'

export function ImprimirCupomBtn({ pedido }: { pedido: Pedido & { itens?: ItemPedido[] } }) {
  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => imprimirCupom(pedido)}>
      <Printer size={14} />
      Imprimir Cupom
    </Button>
  )
}

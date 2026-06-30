'use client'

import { useState } from 'react'
import { PedidosConteudo } from './PedidosConteudo'
import type { Pedido, StatusPedido } from '@/types/database'

interface Props {
  inicial: Pedido[]
}

export function PedidosWrapper({ inicial }: Props) {
  const [filtro, setFiltro] = useState<StatusPedido | 'todos'>('todos')
  return <PedidosConteudo inicial={inicial} filtro={filtro} onFiltro={setFiltro} />
}

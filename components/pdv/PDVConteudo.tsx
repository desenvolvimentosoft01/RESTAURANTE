'use client'

import { useState } from 'react'

import { CardapioGrid } from './CardapioGrid'
import { CarrinhoVenda } from './CarrinhoVenda'
import { ModalPagamento } from './ModalPagamento'
import type { Categoria, Produto } from '@/types/database'

interface Props {
  produtos: Produto[]
  categorias: Categoria[]
}

export function PDVConteudo({ produtos, categorias }: Props) {
  const [modalAberto, setModalAberto] = useState(false)

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      <div className="flex-1 overflow-hidden flex flex-col">
        <CardapioGrid produtos={produtos} categorias={categorias} />
      </div>

      <div className="w-80 bg-white border rounded-lg p-4 flex flex-col">
        <h2 className="font-semibold text-slate-800 mb-3">Carrinho</h2>
        <div className="flex-1 overflow-hidden flex flex-col">
          <CarrinhoVenda onFinalizar={() => setModalAberto(true)} />
        </div>
      </div>

      <ModalPagamento aberto={modalAberto} onFechar={() => setModalAberto(false)} />
    </div>
  )
}

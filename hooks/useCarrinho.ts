'use client'

import { create } from 'zustand'
import type { Produto } from '@/types/database'

export interface ItemCarrinho {
  produto: Produto
  quantidade: number
  observacao: string
}

interface CarrinhoStore {
  itens: ItemCarrinho[]
  adicionarItem: (produto: Produto) => void
  removerItem: (produtoId: string) => void
  alterarQuantidade: (produtoId: string, quantidade: number) => void
  alterarObservacao: (produtoId: string, observacao: string) => void
  limpar: () => void
  total: () => number
  subtotal: () => number
}

export const useCarrinho = create<CarrinhoStore>((set, get) => ({
  itens: [],

  adicionarItem: (produto) => {
    set((state) => {
      const existente = state.itens.find((i) => i.produto.id === produto.id)
      if (existente) {
        return {
          itens: state.itens.map((i) =>
            i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
          ),
        }
      }
      return { itens: [...state.itens, { produto, quantidade: 1, observacao: '' }] }
    })
  },

  removerItem: (produtoId) => {
    set((state) => ({ itens: state.itens.filter((i) => i.produto.id !== produtoId) }))
  },

  alterarQuantidade: (produtoId, quantidade) => {
    if (quantidade <= 0) {
      get().removerItem(produtoId)
      return
    }
    set((state) => ({
      itens: state.itens.map((i) =>
        i.produto.id === produtoId ? { ...i, quantidade } : i
      ),
    }))
  },

  alterarObservacao: (produtoId, observacao) => {
    set((state) => ({
      itens: state.itens.map((i) =>
        i.produto.id === produtoId ? { ...i, observacao } : i
      ),
    }))
  },

  limpar: () => set({ itens: [] }),

  subtotal: () => {
    return get().itens.reduce((acc, i) => acc + i.produto.preco * i.quantidade, 0)
  },

  total: () => get().subtotal(),
}))

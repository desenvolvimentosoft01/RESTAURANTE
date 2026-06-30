'use client'

import { useState } from 'react'
import { formatarMoeda } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useCarrinho } from '@/hooks/useCarrinho'
import type { Categoria, Produto } from '@/types/database'

interface Props {
  produtos: Produto[]
  categorias: Categoria[]
}

export function CardapioGrid({ produtos, categorias }: Props) {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null)
  const adicionarItem = useCarrinho((s) => s.adicionarItem)

  const produtosFiltrados = categoriaSelecionada
    ? produtos.filter((p) => p.categoria_id === categoriaSelecionada)
    : produtos

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={categoriaSelecionada === null ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setCategoriaSelecionada(null)}
        >
          Todos
        </Badge>
        {categorias.map((cat) => (
          <Badge
            key={cat.id}
            variant={categoriaSelecionada === cat.id ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setCategoriaSelecionada(cat.id)}
          >
            {cat.nome}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto flex-1">
        {produtosFiltrados.map((produto) => (
          <button
            key={produto.id}
            onClick={() => adicionarItem(produto)}
            className="text-left border rounded-lg p-3 hover:bg-slate-50 hover:border-slate-400 transition-colors bg-white"
          >
            <p className="font-medium text-slate-800 text-sm leading-tight">{produto.nome}</p>
            {produto.descricao && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{produto.descricao}</p>
            )}
            <p className="text-slate-900 font-semibold mt-2">{formatarMoeda(produto.preco)}</p>
          </button>
        ))}
        {produtosFiltrados.length === 0 && (
          <p className="col-span-full text-center text-slate-500 text-sm py-8">
            Nenhum produto encontrado.
          </p>
        )}
      </div>
    </div>
  )
}

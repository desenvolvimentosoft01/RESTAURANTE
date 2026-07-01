'use client'

import { useState } from 'react'
import { formatarMoeda } from '@/lib/utils'
import { useCarrinho } from '@/hooks/useCarrinho'
import { cn } from '@/lib/utils'
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
    <div className="flex flex-col gap-3 h-full">
      {/* Filtros de categoria */}
      <div className="flex flex-wrap gap-2 pb-1">
        <button
          onClick={() => setCategoriaSelecionada(null)}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-semibold border transition-all',
            categoriaSelecionada === null
              ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
          )}
        >
          Todos
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoriaSelecionada(cat.id)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-semibold border transition-all',
              categoriaSelecionada === cat.id
                ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
            )}
          >
            {cat.nome}
          </button>
        ))}
      </div>

      {/* Grade de produtos */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto flex-1 content-start">
        {produtosFiltrados.map((produto) => (
          <button
            key={produto.id}
            onClick={() => adicionarItem(produto)}
            className="text-left border border-slate-200 rounded-xl p-4 hover:bg-amber-50 hover:border-amber-400 hover:shadow-md transition-all bg-white active:scale-[0.98] group"
          >
            <p className="font-semibold text-slate-800 text-sm leading-tight group-hover:text-amber-700 transition-colors">
              {produto.nome}
            </p>
            {produto.descricao && (
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{produto.descricao}</p>
            )}
            <p className="text-slate-900 font-bold mt-2.5 text-base">{formatarMoeda(produto.preco)}</p>
            {produto.controla_estoque && (
              <p className={`text-[10px] mt-1 font-medium ${produto.estoque_atual <= produto.estoque_minimo ? 'text-red-500' : 'text-slate-400'}`}>
                Estoque: {produto.estoque_atual}
              </p>
            )}
          </button>
        ))}
        {produtosFiltrados.length === 0 && (
          <p className="col-span-full text-center text-slate-400 text-sm py-10">
            Nenhum produto nesta categoria.
          </p>
        )}
      </div>
    </div>
  )
}

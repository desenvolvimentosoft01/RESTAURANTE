'use client'

import { useState } from 'react'

import { cn, formatarMoeda } from '@/lib/utils'
import { useCarrinho } from '@/hooks/useCarrinho'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Categoria, Produto, UnidadeMedida } from '@/types/database'

const UNIDADES_FRACIONADAS: UnidadeMedida[] = ['KG', 'G', 'L', 'ML']

interface Props {
  produtos: Produto[]
  categorias: Categoria[]
}

export function CardapioGrid({ produtos, categorias }: Props) {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null)
  const [produtoPesando, setProdutoPesando] = useState<Produto | null>(null)
  const [peso, setPeso] = useState('')
  const adicionarItem = useCarrinho((s) => s.adicionarItem)

  const produtosFiltrados = categoriaSelecionada
    ? produtos.filter((p) => p.categoria_id === categoriaSelecionada)
    : produtos

  function clicarProduto(produto: Produto) {
    if (UNIDADES_FRACIONADAS.includes(produto.unidade_venda)) {
      setProdutoPesando(produto)
      setPeso('')
      return
    }
    adicionarItem(produto)
  }

  function confirmarPeso() {
    const qtd = Number(peso.replace(',', '.'))
    if (!produtoPesando || !qtd || qtd <= 0) return
    adicionarItem(produtoPesando, qtd)
    setProdutoPesando(null)
    setPeso('')
  }

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
            onClick={() => clicarProduto(produto)}
            className="text-left border border-slate-200 rounded-xl p-4 hover:bg-amber-50 hover:border-amber-400 hover:shadow-md transition-all bg-white active:scale-[0.98] group"
          >
            <p className="font-semibold text-slate-800 text-sm leading-tight group-hover:text-amber-700 transition-colors">
              {produto.nome}
            </p>
            {produto.descricao && (
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{produto.descricao}</p>
            )}
            <p className="text-slate-900 font-bold mt-2.5 text-base">
              {formatarMoeda(produto.preco)}
              {produto.unidade_venda !== 'UN' && <span className="text-xs font-normal text-slate-400">/{produto.unidade_venda}</span>}
            </p>
            {produto.controla_estoque && (
              <p className={`text-[10px] mt-1 font-medium ${produto.estoque_atual <= produto.estoque_minimo ? 'text-red-500' : 'text-slate-400'}`}>
                Estoque: {produto.estoque_atual} {produto.unidade_venda}
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

      <Dialog open={!!produtoPesando} onOpenChange={(open) => !open && setProdutoPesando(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>{produtoPesando?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="peso">Quantidade ({produtoPesando?.unidade_venda})</Label>
            <Input
              id="peso"
              type="number"
              step="0.001"
              min="0"
              autoFocus
              placeholder="Ex: 0,750"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmarPeso()}
            />
            {produtoPesando && !!Number(peso.replace(',', '.')) && (
              <p className="text-sm text-slate-500">
                Subtotal: <strong>{formatarMoeda(produtoPesando.preco * Number(peso.replace(',', '.')))}</strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProdutoPesando(null)}>Cancelar</Button>
            <Button onClick={confirmarPeso}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ListaCategorias } from './ListaCategorias'
import { ListaProdutos } from './ListaProdutos'
import { FormularioProduto } from './FormularioProduto'
import type { Categoria, Produto } from '@/types/database'

export function CardapioConteudo() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  const carregarDados = useCallback(async () => {
    try {
      const supabase = createClient()

      const [resCategorias, resProdutos] = await Promise.all([
        supabase.from('categorias').select('*').order('ordem'),
        supabase.from('produtos').select('*, categoria:categorias(*)').order('nome'),
      ])

      if (resCategorias.error) throw resCategorias.error
      if (resProdutos.error) throw resProdutos.error

      setCategorias(resCategorias.data ?? [])
      setProdutos(resProdutos.data ?? [])
    } catch {
      toast.error('Erro ao carregar o cardápio')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const produtosFiltrados = categoriaSelecionada
    ? produtos.filter((produto) => produto.categoria_id === categoriaSelecionada)
    : produtos

  if (carregando) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ListaCategorias
        categorias={categorias}
        categoriaSelecionada={categoriaSelecionada}
        onSelecionar={setCategoriaSelecionada}
        onAtualizar={carregarDados}
      />

      <Separator />

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Produtos</h2>
        <FormularioProduto categorias={categorias} onSalvo={carregarDados} />
      </div>

      <ListaProdutos
        produtos={produtosFiltrados}
        categorias={categorias}
        onAtualizar={carregarDados}
      />
    </div>
  )
}

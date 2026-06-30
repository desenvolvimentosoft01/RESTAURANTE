'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormularioCategoria } from './FormularioCategoria'
import type { Categoria } from '@/types/database'

interface ListaCategoriasProps {
  categorias: Categoria[]
  categoriaSelecionada: string | null
  onSelecionar: (id: string | null) => void
  onAtualizar: () => void
}

export function ListaCategorias({
  categorias,
  categoriaSelecionada,
  onSelecionar,
  onAtualizar,
}: ListaCategoriasProps) {
  const [excluindo, setExcluindo] = useState<string | null>(null)

  async function alternarAtivo(categoria: Categoria) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('categorias')
        .update({ ativo: !categoria.ativo })
        .eq('id', categoria.id)
      if (error) throw error
      onAtualizar()
    } catch {
      toast.error('Erro ao atualizar categoria')
    }
  }

  async function excluir(categoria: Categoria) {
    if (!confirm(`Excluir a categoria "${categoria.nome}"?`)) return
    setExcluindo(categoria.id)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('categorias').delete().eq('id', categoria.id)
      if (error) throw error
      toast.success('Categoria excluída')
      if (categoriaSelecionada === categoria.id) onSelecionar(null)
      onAtualizar()
    } catch {
      toast.error('Não foi possível excluir. Verifique se há produtos vinculados.')
    } finally {
      setExcluindo(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Categorias</h2>
        <FormularioCategoria onSalvo={onAtualizar} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={categoriaSelecionada === null ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => onSelecionar(null)}
        >
          Todas
        </Badge>
        {categorias.map((categoria) => (
          <div key={categoria.id} className="flex items-center gap-1">
            <Badge
              variant={categoriaSelecionada === categoria.id ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => onSelecionar(categoria.id)}
            >
              {categoria.nome}
              {!categoria.ativo && ' (inativa)'}
            </Badge>
            <FormularioCategoria categoria={categoria} onSalvo={onAtualizar} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => alternarAtivo(categoria)}
            >
              {categoria.ativo ? 'Desativar' : 'Ativar'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={excluindo === categoria.id}
              onClick={() => excluir(categoria)}
            >
              Excluir
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

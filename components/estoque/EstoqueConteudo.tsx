'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FormularioIngrediente } from './FormularioIngrediente'
import { ListaIngredientes } from './ListaIngredientes'
import type { AlertaEstoque, Ingrediente } from '@/types/database'

export function EstoqueConteudo() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [alertas, setAlertas] = useState<AlertaEstoque[]>([])
  const [carregando, setCarregando] = useState(true)

  const carregarDados = useCallback(async () => {
    try {
      const supabase = createClient()
      const [resIngredientes, resAlertas] = await Promise.all([
        supabase.from('ingredientes').select('*').order('nome'),
        supabase.from('alertas_estoque').select('*'),
      ])
      if (resIngredientes.error) throw resIngredientes.error
      if (resAlertas.error) throw resAlertas.error
      setIngredientes(resIngredientes.data ?? [])
      setAlertas(resAlertas.data ?? [])
    } catch {
      toast.error('Erro ao carregar estoque')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  if (carregando) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {alertas.length > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          <Badge variant="destructive">{alertas.length}</Badge>
          <span className="text-sm text-red-700">
            {alertas.length === 1
              ? 'ingrediente abaixo do estoque mínimo'
              : 'ingredientes abaixo do estoque mínimo'}
            : {alertas.map((a) => a.nome).join(', ')}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">
          Ingredientes ({ingredientes.length})
        </h2>
        <FormularioIngrediente onSalvo={carregarDados} />
      </div>

      <ListaIngredientes
        ingredientes={ingredientes}
        alertas={alertas}
        onAtualizar={carregarDados}
      />
    </div>
  )
}

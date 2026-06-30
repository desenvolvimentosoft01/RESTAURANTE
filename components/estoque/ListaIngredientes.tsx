'use client'

import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn, formatarMoeda } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FormularioIngrediente } from './FormularioIngrediente'
import { FormularioEntrada } from './FormularioEntrada'
import { HistoricoMovimentacoes } from './HistoricoMovimentacoes'
import type { AlertaEstoque, Ingrediente } from '@/types/database'

interface Props {
  ingredientes: Ingrediente[]
  alertas: AlertaEstoque[]
  onAtualizar: () => void
}

export function ListaIngredientes({ ingredientes, alertas, onAtualizar }: Props) {
  const idsAlerta = new Set(alertas.map((a) => a.id))

  async function excluir(ingrediente: Ingrediente) {
    if (!confirm(`Excluir "${ingrediente.nome}"?`)) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from('ingredientes').delete().eq('id', ingrediente.id)
      if (error) throw error
      toast.success('Ingrediente excluído')
      onAtualizar()
    } catch {
      toast.error('Não foi possível excluir. Verifique se há ficha técnica vinculada.')
    }
  }

  if (ingredientes.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-8 text-center">
        Nenhum ingrediente cadastrado.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ingrediente</TableHead>
          <TableHead>Unidade</TableHead>
          <TableHead>Qtd. atual</TableHead>
          <TableHead>Qtd. mínima</TableHead>
          <TableHead>Custo unit.</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ingredientes.map((ingrediente) => {
          const emAlerta = idsAlerta.has(ingrediente.id)
          return (
            <TableRow
              key={ingrediente.id}
              className={cn(emAlerta && 'bg-red-50 hover:bg-red-100')}
            >
              <TableCell className="font-medium">{ingrediente.nome}</TableCell>
              <TableCell>{ingrediente.unidade}</TableCell>
              <TableCell
                className={cn('font-semibold', emAlerta && 'text-red-600')}
              >
                {ingrediente.quantidade_atual}
              </TableCell>
              <TableCell>{ingrediente.quantidade_minima}</TableCell>
              <TableCell>{formatarMoeda(ingrediente.preco_custo)}</TableCell>
              <TableCell>
                {emAlerta ? (
                  <Badge variant="destructive">Estoque baixo</Badge>
                ) : (
                  <Badge variant="default">Ok</Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-1">
                <FormularioEntrada ingrediente={ingrediente} onSalvo={onAtualizar} />
                <FormularioIngrediente ingrediente={ingrediente} onSalvo={onAtualizar} />
                <HistoricoMovimentacoes ingrediente={ingrediente} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => excluir(ingrediente)}
                >
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

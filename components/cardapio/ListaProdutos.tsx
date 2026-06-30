'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { formatarMoeda } from '@/lib/utils'
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
import { FormularioProduto } from './FormularioProduto'
import type { Categoria, Produto } from '@/types/database'

interface ListaProdutosProps {
  produtos: Produto[]
  categorias: Categoria[]
  onAtualizar: () => void
}

export function ListaProdutos({ produtos, categorias, onAtualizar }: ListaProdutosProps) {
  const [excluindo, setExcluindo] = useState<string | null>(null)

  async function excluir(produto: Produto) {
    if (!confirm(`Excluir o produto "${produto.nome}"?`)) return
    setExcluindo(produto.id)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('produtos').delete().eq('id', produto.id)
      if (error) throw error
      toast.success('Produto excluído')
      onAtualizar()
    } catch {
      toast.error('Não foi possível excluir o produto')
    } finally {
      setExcluindo(null)
    }
  }

  if (produtos.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-8 text-center">
        Nenhum produto encontrado.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produto</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Preço</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {produtos.map((produto) => (
          <TableRow key={produto.id}>
            <TableCell className="font-medium">{produto.nome}</TableCell>
            <TableCell>{produto.categoria?.nome ?? '—'}</TableCell>
            <TableCell>{formatarMoeda(produto.preco)}</TableCell>
            <TableCell className="space-x-1">
              <Badge variant={produto.ativo ? 'default' : 'outline'}>
                {produto.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
              {produto.disponivel_ifood && <Badge variant="outline">iFood</Badge>}
            </TableCell>
            <TableCell className="text-right space-x-1">
              <FormularioProduto produto={produto} categorias={categorias} onSalvo={onAtualizar} />
              <Button
                variant="ghost"
                size="sm"
                disabled={excluindo === produto.id}
                onClick={() => excluir(produto)}
              >
                Excluir
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

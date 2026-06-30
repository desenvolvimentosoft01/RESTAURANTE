'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatarData } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Ingrediente, MovimentacaoEstoque } from '@/types/database'

interface Props {
  ingrediente: Ingrediente
}

export function HistoricoMovimentacoes({ ingrediente }: Props) {
  const [aberto, setAberto] = useState(false)
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([])
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!aberto) return

    async function carregar() {
      setCarregando(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('movimentacoes_estoque')
          .select('*')
          .eq('ingrediente_id', ingrediente.id)
          .order('created_at', { ascending: false })
          .limit(50)
        if (error) throw error
        setMovimentacoes(data ?? [])
      } finally {
        setCarregando(false)
      }
    }

    carregar()
  }, [aberto, ingrediente.id])

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          Histórico
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Histórico — {ingrediente.nome}</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {carregando ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : movimentacoes.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              Nenhuma movimentação registrada.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimentacoes.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell className="text-xs text-slate-500">
                      {formatarData(mov.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          mov.tipo === 'entrada'
                            ? 'default'
                            : mov.tipo === 'saida'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {mov.tipo === 'entrada'
                          ? 'Entrada'
                          : mov.tipo === 'saida'
                          ? 'Saída'
                          : 'Ajuste'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {mov.quantidade} {ingrediente.unidade}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {mov.motivo ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

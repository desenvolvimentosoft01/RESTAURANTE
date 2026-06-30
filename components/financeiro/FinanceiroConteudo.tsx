'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatarMoeda, formatarDataCurta } from '@/lib/utils'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FormularioDespesa } from './FormularioDespesa'
import type { ResumoFinanceiroHoje, Transacao } from '@/types/database'

const LABELS_CATEGORIA: Record<string, string> = {
  venda: 'Venda',
  compra_insumo: 'Compra de insumo',
  salario: 'Salário',
  aluguel: 'Aluguel',
  energia: 'Energia',
  agua: 'Água',
  gas: 'Gás',
  manutencao: 'Manutenção',
  outros: 'Outros',
}

type Periodo = 'hoje' | 'semana' | 'mes'

function dataInicio(periodo: Periodo): string {
  const d = new Date()
  if (periodo === 'hoje') return d.toISOString().split('T')[0]
  if (periodo === 'semana') {
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  }
  d.setDate(1)
  return d.toISOString().split('T')[0]
}

export function FinanceiroConteudo() {
  const [resumo, setResumo] = useState<ResumoFinanceiroHoje | null>(null)
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos')
  const [carregando, setCarregando] = useState(true)

  const carregarDados = useCallback(async () => {
    setCarregando(true)
    try {
      const supabase = createClient()
      const inicio = dataInicio(periodo)

      const [resResumo, resTransacoes] = await Promise.all([
        supabase.from('resumo_financeiro_hoje').select('*').single(),
        supabase
          .from('transacoes')
          .select('*')
          .gte('data_competencia', inicio)
          .order('data_competencia', { ascending: false }),
      ])

      setResumo(resResumo.data)
      let lista = resTransacoes.data ?? []
      if (filtroTipo !== 'todos') lista = lista.filter((t) => t.tipo === filtroTipo)
      setTransacoes(lista)
    } catch {
      toast.error('Erro ao carregar financeiro')
    } finally {
      setCarregando(false)
    }
  }, [periodo, filtroTipo])

  useEffect(() => { carregarDados() }, [carregarDados])

  const periodos: { valor: Periodo; label: string }[] = [
    { valor: 'hoje', label: 'Hoje' },
    { valor: 'semana', label: '7 dias' },
    { valor: 'mes', label: 'Este mês' },
  ]

  if (carregando) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Entradas hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatarMoeda(resumo?.total_entradas ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Saídas hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatarMoeda(resumo?.total_saidas ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Saldo hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${(resumo?.saldo ?? 0) >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
              {formatarMoeda(resumo?.saldo ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {periodos.map((p) => (
            <button
              key={p.valor}
              onClick={() => setPeriodo(p.valor)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                periodo === p.valor
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border text-slate-700 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => setFiltroTipo(filtroTipo === 'todos' ? 'entrada' : filtroTipo === 'entrada' ? 'saida' : 'todos')}
            className="px-3 py-1.5 rounded-md text-sm font-medium border bg-white text-slate-700 hover:bg-slate-50"
          >
            {filtroTipo === 'todos' ? 'Todos' : filtroTipo === 'entrada' ? 'Entradas' : 'Saídas'}
          </button>
        </div>
        <FormularioDespesa onSalvo={carregarDados} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                transacoes.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm text-slate-500">{formatarDataCurta(t.data_competencia)}</TableCell>
                    <TableCell>{t.descricao}</TableCell>
                    <TableCell className="text-sm">{LABELS_CATEGORIA[t.categoria] ?? t.categoria}</TableCell>
                    <TableCell>
                      <Badge variant={t.tipo === 'entrada' ? 'default' : 'destructive'}>
                        {t.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${t.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.tipo === 'saida' ? '−' : '+'}{formatarMoeda(t.valor)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

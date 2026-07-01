'use client'

import { useCallback, useEffect, useState } from 'react'

import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'

import { formatarDataCurta, formatarMoeda } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ProdutoMaisVendido } from '@/types/database'

interface VendaDia {
  data: string
  total: number
}

interface DRE {
  receitas: number
  despesas: number
  lucro: number
}

export function RelatoriosConteudo() {
  const [vendasDia, setVendasDia] = useState<VendaDia[]>([])
  const [maisVendidos, setMaisVendidos] = useState<ProdutoMaisVendido[]>([])
  const [dre, setDre] = useState<DRE>({ receitas: 0, despesas: 0, lucro: 0 })
  const [dias, setDias] = useState(30)
  const [carregando, setCarregando] = useState(true)

  const carregarDados = useCallback(async () => {
    setCarregando(true)
    try {
      const supabase = createClient()
      const inicio = subDays(new Date(), dias).toISOString().split('T')[0]

      const [resTransacoes, resMaisVendidos] = await Promise.all([
        supabase.from('transacoes').select('tipo, valor, data_competencia').gte('data_competencia', inicio),
        supabase.from('produtos_mais_vendidos').select('*'),
      ])

      if (resTransacoes.error) throw resTransacoes.error

      const transacoes = resTransacoes.data ?? []

      // Vendas por dia (apenas entradas de venda)
      const mapaVendas: Record<string, number> = {}
      transacoes.forEach((t) => {
        if (t.tipo === 'entrada') {
          mapaVendas[t.data_competencia] = (mapaVendas[t.data_competencia] ?? 0) + t.valor
        }
      })
      const vendasOrdenadas: VendaDia[] = Array.from({ length: dias }, (_, i) => {
        const d = subDays(new Date(), dias - 1 - i)
        const key = d.toISOString().split('T')[0]
        return {
          data: format(d, 'dd/MM', { locale: ptBR }),
          total: mapaVendas[key] ?? 0,
        }
      })
      setVendasDia(vendasOrdenadas)

      // DRE
      const receitas = transacoes.filter((t) => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0)
      const despesas = transacoes.filter((t) => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0)
      setDre({ receitas, despesas, lucro: receitas - despesas })

      setMaisVendidos(resMaisVendidos.data ?? [])
    } catch {
      toast.error('Erro ao carregar relatórios')
    } finally {
      setCarregando(false)
    }
  }, [dias])

  useEffect(() => { carregarDados() }, [carregarDados])

  function exportarCSV() {
    const linhas = [
      ['Produto', 'Quantidade vendida', 'Receita total'],
      ...maisVendidos.map((p) => [p.nome_produto, String(p.total_quantidade), String(p.total_receita)]),
    ]
    const csv = linhas.map((l) => l.join(';')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (carregando) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {[7, 15, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDias(d)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              dias === d ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700 hover:bg-slate-50'
            }`}
          >
            {d} dias
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatarMoeda(dre.receitas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatarMoeda(dre.despesas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Lucro bruto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${dre.lucro >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
              {formatarMoeda(dre.lucro)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vendas por dia</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={vendasDia} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="data" tick={{ fontSize: 11 }} interval={dias > 15 ? 4 : 1} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
              <Tooltip formatter={(v) => formatarMoeda(Number(v))} />
              <Bar dataKey="total" fill="#0f172a" radius={[4, 4, 0, 0]} name="Vendas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Produtos mais vendidos</CardTitle>
          <Button variant="outline" size="sm" onClick={exportarCSV}>
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd. vendida</TableHead>
                <TableHead className="text-right">Receita total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maisVendidos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                    Sem dados de vendas ainda.
                  </TableCell>
                </TableRow>
              ) : (
                maisVendidos.map((p, i) => (
                  <TableRow key={p.produto_id}>
                    <TableCell className="text-slate-500">{i + 1}º</TableCell>
                    <TableCell className="font-medium">{p.nome_produto}</TableCell>
                    <TableCell>{p.total_quantidade}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatarMoeda(p.total_receita)}
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

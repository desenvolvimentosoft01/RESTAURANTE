'use client'

import { useState } from 'react'
import { formatarMoeda } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Printer, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { Transacao, Conta, ProdutoMaisVendido } from '@/types/database'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Props {
  transacoes: Transacao[]
  contas: Conta[]
  topProdutos: ProdutoMaisVendido[]
  inicioMes: string
  fimMes: string
}

export function RelatoriosFinanceirosConteudo({ transacoes, contas, topProdutos, inicioMes, fimMes }: Props) {
  const [abaAtiva, setAbaAtiva] = useState<'dre' | 'contas' | 'produtos'>('dre')

  const entradas = transacoes.filter((t) => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0)
  const saidas = transacoes.filter((t) => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0)
  const saldo = entradas - saidas

  const dadosGrafico = transacoes.reduce<Record<string, { data: string; entradas: number; saidas: number }>>((acc, t) => {
    const d = t.data_competencia
    if (!acc[d]) acc[d] = { data: d, entradas: 0, saidas: 0 }
    if (t.tipo === 'entrada') acc[d].entradas += t.valor
    else acc[d].saidas += t.valor
    return acc
  }, {})

  const grafico = Object.values(dadosGrafico).sort((a, b) => a.data.localeCompare(b.data))

  function imprimir() {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          {(['dre', 'contas', 'produtos'] as const).map((aba) => (
            <button
              key={aba}
              onClick={() => setAbaAtiva(aba)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                abaAtiva === aba ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {aba === 'dre' ? 'DRE Mensal' : aba === 'contas' ? 'Contas' : 'Top Produtos'}
            </button>
          ))}
        </div>
        <Button variant="outline" onClick={imprimir} className="print:hidden">
          <Printer size={15} className="mr-2" />
          Imprimir
        </Button>
      </div>

      {abaAtiva === 'dre' && (
        <div className="space-y-6 print-area">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <TrendingUp size={16} />
                <span className="text-sm font-medium">Entradas</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{formatarMoeda(entradas)}</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <TrendingDown size={16} />
                <span className="text-sm font-medium">Saídas</span>
              </div>
              <p className="text-2xl font-bold text-red-700">{formatarMoeda(saidas)}</p>
            </div>
            <div className={`${saldo >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'} border rounded-xl p-5`}>
              <div className={`flex items-center gap-2 ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'} mb-1`}>
                <Minus size={16} />
                <span className="text-sm font-medium">Saldo</span>
              </div>
              <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{formatarMoeda(saldo)}</p>
            </div>
          </div>

          {grafico.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-700 mb-4 text-sm">Entradas × Saídas por dia</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={grafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatarMoeda(Number(v))} />
                  <Bar dataKey="entradas" name="Entradas" fill="#22c55e" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Data</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Descrição</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Categoria</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transacoes.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-xs text-slate-400">{t.data_competencia}</td>
                    <td className="px-5 py-3 text-sm text-slate-700">{t.descricao}</td>
                    <td className="px-5 py-3 text-xs text-slate-500 capitalize">{t.categoria}</td>
                    <td className={`px-5 py-3 text-right font-semibold text-sm ${t.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.tipo === 'entrada' ? '+' : '−'} {formatarMoeda(t.valor)}
                    </td>
                  </tr>
                ))}
                {!transacoes.length && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">
                      Nenhuma transação no mês
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {abaAtiva === 'contas' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Descrição</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Vencimento</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contas.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-sm text-slate-700">{c.descricao}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.tipo === 'pagar' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {c.tipo === 'pagar' ? 'Pagar' : 'Receber'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-sm text-slate-500">{c.vencimento}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.pago ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>
                      {c.pago ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td className={`px-5 py-3 text-right font-semibold text-sm ${c.tipo === 'pagar' ? 'text-red-600' : 'text-green-600'}`}>
                    {formatarMoeda(c.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {abaAtiva === 'produtos' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">#</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Produto</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Vendas</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Receita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topProdutos.map((p, i) => (
                <tr key={p.produto_id ?? p.nome_produto} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-sm font-bold text-slate-400">{i + 1}</td>
                  <td className="px-5 py-3 text-sm font-medium text-slate-800">{p.nome_produto}</td>
                  <td className="px-5 py-3 text-center text-sm text-slate-600">{p.total_quantidade}</td>
                  <td className="px-5 py-3 text-right font-semibold text-green-600">{formatarMoeda(p.total_receita)}</td>
                </tr>
              ))}
              {!topProdutos.length && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">Nenhum dado disponível</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

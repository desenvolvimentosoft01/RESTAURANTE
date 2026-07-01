'use client'

import { useState } from 'react'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Check, Minus, Printer, TrendingDown, TrendingUp, X } from 'lucide-react'

import { formatarMoeda } from '@/lib/utils'
import type { Conta, ProdutoMaisVendido, Transacao } from '@/types/database'

interface Props {
  transacoes: Transacao[]
  contas: Conta[]
  topProdutos: ProdutoMaisVendido[]
  inicioMes: string
  fimMes: string
}

interface CamposImpressao {
  resumo: boolean
  grafico: boolean
  transacoes: boolean
  contas: boolean
  topProdutos: boolean
}

export function RelatoriosFinanceirosConteudo({ transacoes, contas, topProdutos }: Props) {
  const [abaAtiva, setAbaAtiva] = useState<'dre' | 'contas' | 'produtos'>('dre')
  const [dialogImpressao, setDialogImpressao] = useState(false)
  const [campos, setCampos] = useState<CamposImpressao>({
    resumo: true,
    grafico: true,
    transacoes: true,
    contas: false,
    topProdutos: true,
  })

  const entradas = transacoes.filter((t) => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0)
  const saidas   = transacoes.filter((t) => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0)
  const saldo    = entradas - saidas

  const dadosGrafico = transacoes.reduce<Record<string, { data: string; entradas: number; saidas: number }>>((acc, t) => {
    const d = t.data_competencia
    if (!acc[d]) acc[d] = { data: d, entradas: 0, saidas: 0 }
    if (t.tipo === 'entrada') acc[d].entradas += t.valor
    else acc[d].saidas += t.valor
    return acc
  }, {})
  const grafico = Object.values(dadosGrafico).sort((a, b) => a.data.localeCompare(b.data))

  function confirmarImpressao() {
    setDialogImpressao(false)
    // Aplica classes de controle de impressão e dispara print
    setTimeout(() => {
      document.querySelectorAll('[data-print-section]').forEach((el) => {
        const section = el.getAttribute('data-print-section') as keyof CamposImpressao
        ;(el as HTMLElement).style.display = campos[section] ? '' : 'none'
      })
      window.print()
      // Restaura visibilidade após impressão
      setTimeout(() => {
        document.querySelectorAll('[data-print-section]').forEach((el) => {
          ;(el as HTMLElement).style.display = ''
        })
      }, 1000)
    }, 100)
  }

  const toggleCampo = (campo: keyof CamposImpressao) =>
    setCampos((prev) => ({ ...prev, [campo]: !prev[campo] }))

  const OPCOES_IMPRESSAO: { key: keyof CamposImpressao; label: string; descricao: string }[] = [
    { key: 'resumo',      label: 'Resumo DRE',            descricao: 'Cards de Entradas, Saídas e Saldo' },
    { key: 'grafico',     label: 'Gráfico de barras',      descricao: 'Entradas × Saídas por dia' },
    { key: 'transacoes',  label: 'Tabela de transações',   descricao: 'Lista detalhada de todas as movimentações' },
    { key: 'contas',      label: 'Contas a pagar/receber', descricao: 'Status de todas as contas cadastradas' },
    { key: 'topProdutos', label: 'Top produtos',           descricao: 'Ranking dos produtos mais vendidos' },
  ]

  return (
    <div className="space-y-5">
      {/* Abas + botão imprimir */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-slate-200 rounded-lg">
          {(['dre', 'contas', 'produtos'] as const).map((aba) => (
            <button
              key={aba}
              onClick={() => setAbaAtiva(aba)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                abaAtiva === aba
                  ? 'bg-white shadow text-slate-800'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {aba === 'dre' ? 'DRE Mensal' : aba === 'contas' ? 'Contas' : 'Top Produtos'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setDialogImpressao(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors shadow-sm print:hidden"
        >
          <Printer size={15} />
          Imprimir
        </button>
      </div>

      {/* DRE */}
      {abaAtiva === 'dre' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4" data-print-section="resumo">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <TrendingUp size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wide">Entradas</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{formatarMoeda(entradas)}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <TrendingDown size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wide">Saídas</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{formatarMoeda(saidas)}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className={`flex items-center gap-2 mb-2 ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                <Minus size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wide">Saldo</span>
              </div>
              <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatarMoeda(saldo)}
              </p>
            </div>
          </div>

          {grafico.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm" data-print-section="grafico">
              <h3 className="font-semibold text-slate-700 mb-4 text-sm">Entradas × Saídas por dia</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={grafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="data" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(v) => formatarMoeda(Number(v))}
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm" data-print-section="transacoes">
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="font-semibold text-slate-700 text-sm">Transações do Mês</h3>
              <span className="text-xs text-slate-400">{transacoes.length} registro(s)</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Data</th>
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Descrição</th>
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Categoria</th>
                  <th className="text-right px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transacoes.map((t, i) => (
                  <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                    <td className="px-5 py-2.5 text-xs text-slate-400">{t.data_competencia}</td>
                    <td className="px-5 py-2.5 text-sm text-slate-700">{t.descricao}</td>
                    <td className="px-5 py-2.5 text-xs text-slate-500 capitalize">{t.categoria}</td>
                    <td className={`px-5 py-2.5 text-right font-bold text-sm ${t.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.tipo === 'entrada' ? '+' : '−'} {formatarMoeda(t.valor)}
                    </td>
                  </tr>
                ))}
                {!transacoes.length && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">Nenhuma transação no mês</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contas */}
      {abaAtiva === 'contas' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm" data-print-section="contas">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="font-semibold text-slate-700 text-sm">Contas a Pagar / Receber</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase">Descrição</th>
                <th className="text-center px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase">Tipo</th>
                <th className="text-center px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase">Vencimento</th>
                <th className="text-center px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase">Status</th>
                <th className="text-right px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {contas.map((c, i) => (
                <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                  <td className="px-5 py-2.5 text-sm text-slate-700">{c.descricao}</td>
                  <td className="px-5 py-2.5 text-center">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${c.tipo === 'pagar' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {c.tipo === 'pagar' ? 'Pagar' : 'Receber'}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-center text-sm text-slate-500">{c.vencimento}</td>
                  <td className="px-5 py-2.5 text-center">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${c.pago ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>
                      {c.pago ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td className={`px-5 py-2.5 text-right font-bold text-sm ${c.tipo === 'pagar' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatarMoeda(c.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Top Produtos */}
      {abaAtiva === 'produtos' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm" data-print-section="topProdutos">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="font-semibold text-slate-700 text-sm">Produtos Mais Vendidos</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase w-10">#</th>
                <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase">Produto</th>
                <th className="text-center px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase">Vendas (un.)</th>
                <th className="text-right px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase">Receita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topProdutos.map((p, i) => (
                <tr key={p.produto_id ?? p.nome_produto} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                  <td className="px-5 py-3 font-bold text-slate-400 text-lg">{i + 1}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{p.nome_produto}</td>
                  <td className="px-5 py-3 text-center font-bold text-slate-700">{p.total_quantidade}</td>
                  <td className="px-5 py-3 text-right font-bold text-emerald-600">{formatarMoeda(p.total_receita)}</td>
                </tr>
              ))}
              {!topProdutos.length && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">Nenhum dado disponível</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog de opções de impressão */}
      {dialogImpressao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Printer size={18} className="text-slate-700" />
                <h3 className="font-bold text-slate-800">Opções de Impressão</h3>
              </div>
              <button onClick={() => setDialogImpressao(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-1">
              <p className="text-sm text-slate-500 mb-4">Selecione quais seções deseja incluir no relatório impresso:</p>
              {OPCOES_IMPRESSAO.map((opcao) => (
                <label key={opcao.key} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group">
                  <div
                    onClick={() => toggleCampo(opcao.key)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      campos[opcao.key]
                        ? 'bg-slate-800 border-slate-800'
                        : 'border-slate-300 bg-white group-hover:border-slate-400'
                    }`}
                  >
                    {campos[opcao.key] && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <div onClick={() => toggleCampo(opcao.key)}>
                    <p className="text-sm font-semibold text-slate-700">{opcao.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{opcao.descricao}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <button
                onClick={() => setDialogImpressao(false)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarImpressao}
                disabled={!Object.values(campos).some(Boolean)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer size={14} />
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

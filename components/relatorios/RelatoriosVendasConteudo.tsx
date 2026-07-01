'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { formatarMoeda } from '@/lib/utils'
import { Printer, X, Check, TrendingUp, ShoppingBag, CreditCard, BarChart3 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { FiltroRelatorio } from './FiltroRelatorio'
import type { Pedido } from '@/types/database'

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', confirmado: 'Confirmado', em_preparo: 'Em preparo',
  pronto: 'Pronto', entregue: 'Entregue', cancelado: 'Cancelado',
}

const PAGAMENTO_LABEL: Record<string, string> = {
  dinheiro: 'Dinheiro', credito: 'Crédito', debito: 'Débito', pix: 'Pix', ifood: 'iFood',
}

type Secao = 'resumo' | 'pagamentos' | 'diario' | 'tabela'

const SECOES: { key: Secao; label: string; descricao: string }[] = [
  { key: 'resumo',    label: 'Cards de Resumo',     descricao: 'Receita, pedidos, ticket médio e canais' },
  { key: 'pagamentos', label: 'Formas de Pagamento', descricao: 'Gráfico com distribuição por forma de pagamento' },
  { key: 'diario',    label: 'Vendas por Dia',       descricao: 'Gráfico de barras com faturamento diário' },
  { key: 'tabela',    label: 'Lista de Pedidos',      descricao: 'Tabela detalhada de todos os pedidos' },
]

const CORES_PIE = ['#1e40af','#059669','#d97706','#dc2626','#7c3aed','#0891b2']

interface Props {
  pedidos: (Pedido & { itens?: { nome_produto: string; quantidade: number; subtotal: number; preco_unitario: number }[] })[]
  inicioPeriodo: string
  fimPeriodo: string
}

export function RelatoriosVendasConteudo({ pedidos, inicioPeriodo, fimPeriodo }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const [inicio, setInicio] = useState(inicioPeriodo)
  const [fim, setFim]       = useState(fimPeriodo)
  const [filtroOrigem, setFiltroOrigem] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [dialogImpressao, setDialogImpressao] = useState(false)
  const [campos, setCampos] = useState<Record<Secao, boolean>>({
    resumo: true, pagamentos: true, diario: true, tabela: true,
  })

  // Aplica filtros locais (origem, status)
  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtroOrigem !== 'todos' && p.origem !== filtroOrigem) return false
    if (filtroStatus !== 'todos' && p.status !== filtroStatus) return false
    return true
  })

  const pedidosValidos = pedidosFiltrados.filter((p) => p.status !== 'cancelado')
  const pedidosCancelados = pedidosFiltrados.filter((p) => p.status === 'cancelado')

  const totalReceita  = pedidosValidos.reduce((s, p) => s + p.total, 0)
  const ticketMedio   = pedidosValidos.length > 0 ? totalReceita / pedidosValidos.length : 0
  const totalIfood    = pedidosValidos.filter((p) => p.origem === 'ifood').length
  const totalBalcao   = pedidosValidos.filter((p) => p.origem === 'balcao').length

  // Formas de pagamento
  const porPagamento = Object.entries(
    pedidosValidos.reduce<Record<string, number>>((acc, p) => {
      const fp = p.forma_pagamento ?? 'outros'
      acc[fp] = (acc[fp] ?? 0) + p.total
      return acc
    }, {})
  )
    .map(([name, value]) => ({ name: PAGAMENTO_LABEL[name] ?? name, value }))
    .sort((a, b) => b.value - a.value)

  // Vendas por dia
  const porDia = Object.entries(
    pedidosValidos.reduce<Record<string, number>>((acc, p) => {
      const dia = p.created_at.split('T')[0]
      acc[dia] = (acc[dia] ?? 0) + p.total
      return acc
    }, {})
  )
    .map(([data, total]) => ({ data, total }))
    .sort((a, b) => a.data.localeCompare(b.data))

  function navegar(i: string, f: string) {
    startTransition(() => router.push(`${pathname}?inicio=${i}&fim=${f}`))
  }

  function confirmarImpressao() {
    setDialogImpressao(false)
    setTimeout(() => {
      document.querySelectorAll<HTMLElement>('[data-print-section]').forEach((el) => {
        const s = el.getAttribute('data-print-section') as Secao
        el.style.display = campos[s] ? '' : 'none'
      })
      window.print()
      setTimeout(() => {
        document.querySelectorAll<HTMLElement>('[data-print-section]').forEach((el) => {
          el.style.display = ''
        })
      }, 1500)
    }, 100)
  }

  return (
    <div className="space-y-5">
      {/* Filtro */}
      <FiltroRelatorio inicio={inicio} fim={fim} setInicio={setInicio} setFim={setFim}
        extraParams={{}}>
        <div className="flex flex-col gap-1 self-end">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Canal</span>
          <select
            value={filtroOrigem}
            onChange={(e) => setFiltroOrigem(e.target.value)}
            className="h-8 px-3 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="todos">Todos os canais</option>
            <option value="balcao">Balcão</option>
            <option value="ifood">iFood</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 self-end">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Status</span>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="h-8 px-3 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="todos">Todos os status</option>
            <option value="entregue">Entregue</option>
            <option value="pronto">Pronto</option>
            <option value="em_preparo">Em preparo</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <button
          onClick={() => setDialogImpressao(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm self-end print:hidden"
        >
          <Printer size={13} />
          Imprimir
        </button>
      </FiltroRelatorio>

      {/* Resumo */}
      <div className="grid grid-cols-4 gap-3" data-print-section="resumo">
        {[
          { label: 'Receita Total', valor: formatarMoeda(totalReceita), sub: `${pedidosValidos.length} pedido(s)`, cor: 'emerald', icon: TrendingUp },
          { label: 'Ticket Médio',  valor: formatarMoeda(ticketMedio),  sub: 'por pedido',          cor: 'blue',    icon: BarChart3 },
          { label: 'Balcão',        valor: `${totalBalcao}`,            sub: `${formatarMoeda(pedidosValidos.filter(p=>p.origem==='balcao').reduce((s,p)=>s+p.total,0))}`, cor: 'slate', icon: ShoppingBag },
          { label: 'iFood',         valor: `${totalIfood}`,             sub: `${formatarMoeda(pedidosValidos.filter(p=>p.origem==='ifood').reduce((s,p)=>s+p.total,0))}`, cor: 'red',   icon: CreditCard },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{c.label}</p>
            <p className={`text-xl font-black mt-1 text-${c.cor}-600`}>{c.valor}</p>
            <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {pedidosCancelados.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
          <strong>{pedidosCancelados.length}</strong> pedido(s) cancelado(s) no período —
          não incluídos nos totais ({formatarMoeda(pedidosCancelados.reduce((s,p)=>s+p.total,0))})
        </div>
      )}

      {/* Gráficos lado a lado */}
      <div className="grid grid-cols-5 gap-4" data-print-section="pagamentos">
        {/* Pie — pagamentos */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-700 text-sm mb-3">Formas de Pagamento</h3>
          {porPagamento.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={porPagamento}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  outerRadius={75}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {porPagamento.map((_, i) => <Cell key={i} fill={CORES_PIE[i % CORES_PIE.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatarMoeda(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Sem dados</p>
          )}
          <div className="mt-2 space-y-1">
            {porPagamento.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: CORES_PIE[i % CORES_PIE.length] }} />
                  <span className="text-slate-600">{p.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{formatarMoeda(p.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar — vendas por dia */}
        <div className="col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-sm" data-print-section="diario">
          <h3 className="font-semibold text-slate-700 text-sm mb-3">Faturamento por Dia</h3>
          {porDia.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={porDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="data" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tickFormatter={(v) => `R$${(v/1000).toFixed(1)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip formatter={(v) => formatarMoeda(Number(v))} />
                <Bar dataKey="total" name="Faturamento" fill="#1e40af" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Sem vendas no período</p>
          )}
        </div>
      </div>

      {/* Tabela de pedidos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" data-print-section="tabela">
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
          <h3 className="font-semibold text-slate-700 text-sm">Lista de Pedidos</h3>
          <span className="text-xs text-slate-400">{pedidosFiltrados.length} pedido(s)</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700 text-white text-[11px] uppercase tracking-wide">
              <th className="text-left px-4 py-2.5">Data/Hora</th>
              <th className="text-left px-4 py-2.5">Cliente</th>
              <th className="text-center px-4 py-2.5">Canal</th>
              <th className="text-left px-4 py-2.5">Pagamento</th>
              <th className="text-center px-4 py-2.5">Status</th>
              <th className="text-right px-4 py-2.5">Total</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map((p, i) => (
              <tr key={p.id} className={`border-b border-slate-50 ${i%2===0?'bg-white':'bg-slate-50/40'}`}>
                <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">
                  {new Date(p.created_at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
                </td>
                <td className="px-4 py-2.5 text-sm text-slate-700">{p.nome_cliente ?? '—'}</td>
                <td className="px-4 py-2.5 text-center text-sm">{p.origem==='ifood'?'🛵 iFood':'🏪 Balcão'}</td>
                <td className="px-4 py-2.5 text-sm text-slate-500">{PAGAMENTO_LABEL[p.forma_pagamento??''] ?? '—'}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.status==='cancelado' ? 'bg-red-100 text-red-700'
                    : p.status==='entregue' ? 'bg-slate-100 text-slate-600'
                    : 'bg-amber-100 text-amber-700'
                  }`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td className={`px-4 py-2.5 text-right font-bold text-sm ${p.status==='cancelado'?'text-red-400 line-through':'text-slate-800'}`}>
                  {formatarMoeda(p.total)}
                </td>
              </tr>
            ))}
            {!pedidosFiltrados.length && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">Nenhum pedido no período</td></tr>
            )}
          </tbody>
          {pedidosValidos.length > 0 && (
            <tfoot>
              <tr className="bg-slate-800 text-white text-sm">
                <td className="px-4 py-2.5 font-semibold" colSpan={5}>Total (excluindo cancelados)</td>
                <td className="px-4 py-2.5 text-right font-black text-emerald-400">{formatarMoeda(totalReceita)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Dialog impressão */}
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
              <p className="text-sm text-slate-500 mb-4">Período: <strong>{inicioPeriodo}</strong> a <strong>{fimPeriodo}</strong></p>
              {SECOES.map((s) => (
                <label key={s.key} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer group"
                  onClick={() => setCampos((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}>
                  <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                    campos[s.key] ? 'bg-slate-800 border-slate-800' : 'border-slate-300 group-hover:border-slate-400'
                  }`}>
                    {campos[s.key] && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{s.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.descricao}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <button onClick={() => setDialogImpressao(false)} className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancelar</button>
              <button onClick={confirmarImpressao} disabled={!Object.values(campos).some(Boolean)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50">
                <Printer size={14} /> Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

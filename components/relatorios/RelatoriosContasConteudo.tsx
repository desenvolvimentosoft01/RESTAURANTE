'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { Check, Clock, Printer, TrendingDown, TrendingUp, X } from 'lucide-react'

import { formatarMoeda } from '@/lib/utils'
import { FiltroRelatorio } from './FiltroRelatorio'
import type { Conta } from '@/types/database'

type Secao = 'resumo' | 'tabela'
const SECOES: { key: Secao; label: string; descricao: string }[] = [
  { key: 'resumo', label: 'Resumo de Totais', descricao: 'Totais de pagar, receber e saldo' },
  { key: 'tabela', label: 'Lista de Contas',   descricao: 'Tabela detalhada de todas as contas' },
]

interface Filtros { tipo: string; status: string; categoria: string }

interface Props {
  contas: Conta[]
  categorias: string[]
  inicioPeriodo: string
  fimPeriodo: string
  filtros: Filtros
}

export function RelatoriosContasConteudo({ contas, categorias, inicioPeriodo, fimPeriodo, filtros }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const [inicio, setInicio] = useState(inicioPeriodo)
  const [fim, setFim]       = useState(fimPeriodo)
  const [tipo, setTipo]     = useState(filtros.tipo)
  const [status, setStatus] = useState(filtros.status)
  const [categ, setCateg]   = useState(filtros.categoria)
  const [dialogImpressao, setDialogImpressao] = useState(false)
  const [campos, setCampos] = useState<Record<Secao, boolean>>({ resumo: true, tabela: true })

  function navegar(i: string, f: string) {
    const qs = new URLSearchParams({ inicio: i, fim: f, tipo, status, categoria: categ }).toString()
    startTransition(() => router.push(`${pathname}?${qs}`))
  }

  function aplicarFiltros() {
    const qs = new URLSearchParams({ inicio, fim, tipo, status, categoria: categ }).toString()
    startTransition(() => router.push(`${pathname}?${qs}`))
  }

  const totalPagar    = contas.filter(c=>c.tipo==='pagar').reduce((s,c)=>s+c.valor,0)
  const totalReceber  = contas.filter(c=>c.tipo==='receber').reduce((s,c)=>s+c.valor,0)
  const totalPagoPago = contas.filter(c=>c.pago&&c.tipo==='pagar').reduce((s,c)=>s+c.valor,0)
  const totalRecebido = contas.filter(c=>c.pago&&c.tipo==='receber').reduce((s,c)=>s+c.valor,0)
  const pendentePagar   = contas.filter(c=>!c.pago&&c.tipo==='pagar').reduce((s,c)=>s+c.valor,0)
  const pendenteReceber = contas.filter(c=>!c.pago&&c.tipo==='receber').reduce((s,c)=>s+c.valor,0)

  const hoje = new Date().toISOString().split('T')[0]
  const vencidas = contas.filter(c=>!c.pago && c.vencimento < hoje)

  function confirmarImpressao() {
    setDialogImpressao(false)
    setTimeout(() => {
      document.querySelectorAll<HTMLElement>('[data-print-section]').forEach((el) => {
        const s = el.getAttribute('data-print-section') as Secao
        el.style.display = campos[s] ? '' : 'none'
      })
      window.print()
      setTimeout(() => document.querySelectorAll<HTMLElement>('[data-print-section]').forEach(el => { el.style.display = '' }), 1500)
    }, 100)
  }

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <FiltroRelatorio inicio={inicio} fim={fim} setInicio={setInicio} setFim={(v) => { setFim(v); }} extraParams={{ tipo, status, categoria: categ }}>
        <div className="flex flex-col gap-1 self-end">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Tipo</span>
          <select value={tipo} onChange={e=>setTipo(e.target.value)}
            className="h-8 px-3 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400">
            <option value="todos">Pagar + Receber</option>
            <option value="pagar">A Pagar</option>
            <option value="receber">A Receber</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 self-end">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Status</span>
          <select value={status} onChange={e=>setStatus(e.target.value)}
            className="h-8 px-3 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400">
            <option value="todos">Todos</option>
            <option value="pendente">Pendentes</option>
            <option value="pago">Pagos/Recebidos</option>
          </select>
        </div>
        {categorias.length > 0 && (
          <div className="flex flex-col gap-1 self-end">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Categoria</span>
            <select value={categ} onChange={e=>setCateg(e.target.value)}
              className="h-8 px-3 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400">
              <option value="todos">Todas</option>
              {categorias.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </div>
        )}
        <button onClick={() => setDialogImpressao(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 self-end print:hidden">
          <Printer size={13} /> Imprimir
        </button>
      </FiltroRelatorio>

      {/* Alerta de vencidas */}
      {vencidas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
          <Clock size={15} className="text-red-600 shrink-0" />
          <p className="text-sm text-red-700">
            <strong>{vencidas.length}</strong> conta(s) vencida(s) e não paga(s) —
            total de <strong>{formatarMoeda(vencidas.reduce((s,c)=>s+c.valor,0))}</strong>
          </p>
        </div>
      )}

      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-4" data-print-section="resumo">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">A Pagar</p>
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center"><TrendingDown size={15} className="text-red-600" /></div>
          </div>
          <p className="text-2xl font-black text-red-600">{formatarMoeda(totalPagar)}</p>
          <div className="mt-2 space-y-1 text-xs text-slate-500">
            <div className="flex justify-between"><span>Pago:</span><span className="font-semibold text-slate-700">{formatarMoeda(totalPagoPago)}</span></div>
            <div className="flex justify-between"><span>Pendente:</span><span className="font-semibold text-red-600">{formatarMoeda(pendentePagar)}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">A Receber</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><TrendingUp size={15} className="text-emerald-600" /></div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{formatarMoeda(totalReceber)}</p>
          <div className="mt-2 space-y-1 text-xs text-slate-500">
            <div className="flex justify-between"><span>Recebido:</span><span className="font-semibold text-slate-700">{formatarMoeda(totalRecebido)}</span></div>
            <div className="flex justify-between"><span>Pendente:</span><span className="font-semibold text-emerald-600">{formatarMoeda(pendenteReceber)}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">Saldo Previsto</p>
          {(() => {
            const saldo = totalReceber - totalPagar
            return <p className={`text-2xl font-black ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatarMoeda(saldo)}</p>
          })()}
          <p className="text-xs text-slate-400 mt-2">{contas.length} conta(s) no período</p>
          {vencidas.length > 0 && (
            <p className="text-xs text-red-500 mt-1 font-medium">⚠ {vencidas.length} vencida(s)</p>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" data-print-section="tabela">
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
          <h3 className="font-semibold text-slate-700 text-sm">Lista de Contas</h3>
          <span className="text-xs text-slate-400">{contas.length} registro(s)</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700 text-white text-[11px] uppercase tracking-wide">
              <th className="text-left px-4 py-2.5">Descrição</th>
              <th className="text-left px-4 py-2.5">Categoria</th>
              <th className="text-center px-4 py-2.5">Tipo</th>
              <th className="text-center px-4 py-2.5">Vencimento</th>
              <th className="text-center px-4 py-2.5">Status</th>
              <th className="text-right px-4 py-2.5">Valor</th>
            </tr>
          </thead>
          <tbody>
            {contas.map((c, i) => {
              const vencida = !c.pago && c.vencimento < hoje
              return (
                <tr key={c.id} className={`border-b border-slate-50 ${i%2===0?'bg-white':'bg-slate-50/40'} ${vencida?'bg-red-50/30':''}`}>
                  <td className="px-4 py-2.5 text-sm font-semibold text-slate-800">{c.descricao}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 capitalize">{c.categoria ?? '—'}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.tipo==='pagar'?'bg-red-100 text-red-700':'bg-emerald-100 text-emerald-700'}`}>
                      {c.tipo==='pagar'?'Pagar':'Receber'}
                    </span>
                  </td>
                  <td className={`px-4 py-2.5 text-center text-sm ${vencida?'text-red-600 font-bold':''}`}>
                    {c.vencimento}{vencida&&' ⚠'}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.pago?'bg-slate-100 text-slate-600':'bg-amber-100 text-amber-700'}`}>
                      {c.pago?'Pago':'Pendente'}
                    </span>
                  </td>
                  <td className={`px-4 py-2.5 text-right font-bold text-sm ${c.tipo==='pagar'?'text-red-600':'text-emerald-600'}`}>
                    {formatarMoeda(c.valor)}
                  </td>
                </tr>
              )
            })}
            {!contas.length && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">Nenhuma conta no período com os filtros aplicados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog impressão */}
      {dialogImpressao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2"><Printer size={18} className="text-slate-700" /><h3 className="font-bold text-slate-800">Opções de Impressão</h3></div>
              <button onClick={() => setDialogImpressao(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="px-6 py-4 space-y-1">
              <p className="text-sm text-slate-500 mb-4">Período: <strong>{inicioPeriodo}</strong> a <strong>{fimPeriodo}</strong></p>
              {SECOES.map((s) => (
                <label key={s.key} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer group"
                  onClick={() => setCampos(prev => ({ ...prev, [s.key]: !prev[s.key] }))}>
                  <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${campos[s.key]?'bg-slate-800 border-slate-800':'border-slate-300 group-hover:border-slate-400'}`}>
                    {campos[s.key] && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <div><p className="text-sm font-semibold text-slate-700">{s.label}</p><p className="text-xs text-slate-400 mt-0.5">{s.descricao}</p></div>
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

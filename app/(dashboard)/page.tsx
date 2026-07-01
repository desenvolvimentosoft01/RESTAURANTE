import { createClient } from '@/lib/supabase/server'
import { formatarMoeda, formatarData } from '@/lib/utils'
import {
  TrendingUp, TrendingDown, Wallet, ShoppingBag,
  Clock, ChefHat, CheckCircle, AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

const STATUS_LABEL: Record<string, { label: string; cor: string; bg: string }> = {
  pendente:   { label: 'Pendente',   cor: 'text-amber-700',   bg: 'bg-amber-100' },
  confirmado: { label: 'Confirmado', cor: 'text-blue-700',    bg: 'bg-blue-100' },
  em_preparo: { label: 'Em preparo', cor: 'text-orange-700',  bg: 'bg-orange-100' },
  pronto:     { label: 'Pronto',     cor: 'text-emerald-700', bg: 'bg-emerald-100' },
  entregue:   { label: 'Entregue',   cor: 'text-slate-600',   bg: 'bg-slate-100' },
  cancelado:  { label: 'Cancelado',  cor: 'text-red-700',     bg: 'bg-red-100' },
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const hoje = new Date().toISOString().split('T')[0]

  const [resResumo, resPedidosHoje, resAlertas, resPendentes] = await Promise.all([
    supabase.from('resumo_financeiro_hoje').select('*').single(),
    supabase.from('pedidos').select('id, status, total, created_at, origem, nome_cliente').gte('created_at', hoje + 'T00:00:00').order('created_at', { ascending: false }).limit(8),
    supabase.from('alertas_estoque').select('nome, quantidade_atual, quantidade_minima'),
    supabase.from('pedidos').select('id, status, total, origem, nome_cliente').in('status', ['pendente','confirmado','em_preparo','pronto']).order('created_at'),
  ])

  const resumo = resResumo.data
  const pedidosHoje = resPedidosHoje.data ?? []
  const alertas = resAlertas.data ?? []
  const pendentes = resPendentes.data ?? []

  const prontos = pendentes.filter(p => p.status === 'pronto')
  const emPreparo = pendentes.filter(p => p.status === 'em_preparo')

  return (
    <div className="space-y-5">
      {/* Cards de resumo */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Entradas Hoje</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{formatarMoeda(resumo?.total_entradas ?? 0)}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp size={18} className="text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Saídas Hoje</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{formatarMoeda(resumo?.total_saidas ?? 0)}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown size={18} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Saldo do Dia</p>
              <p className={`text-2xl font-bold mt-1 ${(resumo?.saldo ?? 0) >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                {formatarMoeda(resumo?.saldo ?? 0)}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <Wallet size={18} className="text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Pedidos Hoje</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{pedidosHoje.length}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <ShoppingBag size={18} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Pedidos em andamento */}
        <div className="col-span-2 space-y-3">
          {/* Prontos para entrega */}
          {prontos.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-emerald-200 bg-emerald-100">
                <CheckCircle size={15} className="text-emerald-700" />
                <h2 className="text-sm font-bold text-emerald-800">Prontos para Entrega ({prontos.length})</h2>
              </div>
              <div className="divide-y divide-emerald-100">
                {prontos.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{p.nome_cliente ?? (p.origem === 'ifood' ? '🛵 iFood' : '🏪 Balcão')}</p>
                    </div>
                    <span className="font-bold text-emerald-700">{formatarMoeda(p.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Em preparo */}
          {emPreparo.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-orange-200 bg-orange-100">
                <ChefHat size={15} className="text-orange-700" />
                <h2 className="text-sm font-bold text-orange-800">Em Preparo ({emPreparo.length})</h2>
              </div>
              <div className="divide-y divide-orange-100">
                {emPreparo.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
                    <p className="text-sm font-medium text-slate-700">{p.nome_cliente ?? (p.origem === 'ifood' ? '🛵 iFood' : '🏪 Balcão')}</p>
                    <span className="font-semibold text-orange-700">{formatarMoeda(p.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Últimos pedidos do dia */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 bg-slate-50">
              <Clock size={14} className="text-slate-500" />
              <h2 className="text-sm font-bold text-slate-700">Últimos Pedidos do Dia</h2>
            </div>
            {!pedidosHoje.length ? (
              <p className="text-sm text-slate-400 text-center py-8">Nenhum pedido hoje</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase">Cliente</th>
                    <th className="text-left px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase">Origem</th>
                    <th className="text-left px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase">Hora</th>
                    <th className="text-center px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase">Status</th>
                    <th className="text-right px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosHoje.map((p, i) => {
                    const s = STATUS_LABEL[p.status] ?? { label: p.status, cor: 'text-slate-600', bg: 'bg-slate-100' }
                    return (
                      <tr key={p.id} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                        <td className="px-4 py-2.5 text-slate-700 font-medium">{p.nome_cliente ?? '—'}</td>
                        <td className="px-4 py-2.5 text-slate-500 text-xs">{p.origem === 'ifood' ? '🛵 iFood' : '🏪 Balcão'}</td>
                        <td className="px-4 py-2.5 text-slate-400 text-xs">{formatarData(p.created_at)}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.cor}`}>{s.label}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-800">{formatarMoeda(p.total)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Lateral direita */}
        <div className="space-y-4">
          {alertas.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-red-200 bg-red-100">
                <AlertTriangle size={14} className="text-red-700" />
                <h2 className="text-sm font-bold text-red-800">Estoque Baixo ({alertas.length})</h2>
              </div>
              <div className="divide-y divide-red-100">
                {alertas.map((a, i) => (
                  <div key={i} className="px-4 py-2.5">
                    <p className="text-sm font-medium text-slate-700">{a.nome}</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      {a.quantidade_atual} restante(s) / mín. {a.quantidade_minima}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-red-200">
                <Link href="/produtos/estoque" className="text-xs text-red-600 font-medium hover:underline">
                  Ver estoque →
                </Link>
              </div>
            </div>
          )}

          {/* Atalhos */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
              <h2 className="text-sm font-bold text-slate-700">Acesso Rápido</h2>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {[
                { href: '/venda-balcao', label: 'Venda Balcão', emoji: '🏪' },
                { href: '/pedidos', label: 'Pedidos iFood', emoji: '🛵' },
                { href: '/produtos/novo', label: 'Novo Produto', emoji: '➕' },
                { href: '/financeiro/contas', label: 'Contas', emoji: '💰' },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-amber-300 transition-all text-center"
                >
                  <span className="text-xl">{a.emoji}</span>
                  <span className="text-[11px] font-medium text-slate-600">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

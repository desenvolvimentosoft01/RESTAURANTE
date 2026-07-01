'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BarChart3, Check, Filter, Layers, Package2, Printer, Search, ShoppingBag, TrendingUp, X } from 'lucide-react'

import { formatarMoeda } from '@/lib/utils'

interface VendaProduto {
  produto_id: string | null
  nome_produto: string
  total_quantidade: number
  total_receita: number
  preco_unitario: number
}

interface ItemEstoque {
  id: string
  nome: string
  estoque_atual: number
  estoque_minimo: number
  controla_estoque: boolean
  categoria: { nome: string } | null
}

interface Categoria { id: string; nome: string }

interface Totais {
  totalPedidos: number
  totalReceita: number
  totalItens: number
  ticketMedio: number
  pedidosIfood: number
  pedidosBalcao: number
}

interface Props {
  vendasPorProduto: VendaProduto[]
  estoque: ItemEstoque[]
  categorias: Categoria[]
  inicioPeriodo: string
  fimPeriodo: string
  totais: Totais
}

type Secao = 'resumo' | 'grafico' | 'ranking' | 'estoque'

const SECOES: { key: Secao; label: string; descricao: string }[] = [
  { key: 'resumo',  label: 'Cards de Resumo',      descricao: 'Total de pedidos, receita, ticket médio e canais' },
  { key: 'grafico', label: 'Gráfico Top Produtos',  descricao: 'Barras com os produtos mais vendidos' },
  { key: 'ranking', label: 'Ranking de Produtos',   descricao: 'Tabela completa com quantidade e receita por produto' },
  { key: 'estoque', label: 'Status do Estoque',     descricao: 'Situação atual dos produtos com controle de estoque' },
]

const CORES_GRAFICO = ['#1e40af','#1d4ed8','#2563eb','#3b82f6','#60a5fa','#93c5fd','#bfdbfe','#dbeafe']

export function RelatoriosProdutosConteudo({
  vendasPorProduto, estoque, categorias, inicioPeriodo, fimPeriodo, totais,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const [inicio, setInicio] = useState(inicioPeriodo)
  const [fim, setFim]       = useState(fimPeriodo)
  const [busca, setBusca]   = useState('')
  const [abaAtiva, setAbaAtiva] = useState<'ranking' | 'estoque'>('ranking')
  const [dialogImpressao, setDialogImpressao] = useState(false)
  const [campos, setCampos] = useState<Record<Secao, boolean>>({
    resumo: true, grafico: true, ranking: true, estoque: true,
  })

  const top10 = vendasPorProduto.slice(0, 10)
  const produtosFiltrados = vendasPorProduto.filter((p) =>
    p.nome_produto.toLowerCase().includes(busca.toLowerCase())
  )

  function aplicarFiltro() {
    startTransition(() => {
      router.push(`${pathname}?inicio=${inicio}&fim=${fim}`)
    })
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

  const estoqueAlerta = estoque.filter((e) => e.estoque_atual <= e.estoque_minimo)
  const estoqueOk     = estoque.filter((e) => e.estoque_atual > e.estoque_minimo)

  return (
    <div className="space-y-5">

      {/* Filtro de período */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Período</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">De</label>
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="h-8 px-3 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Até</label>
            <input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              className="h-8 px-3 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {/* Atalhos rápidos */}
          <div className="flex gap-1.5">
            {[
              { label: 'Hoje', dias: 0 },
              { label: '7 dias', dias: 7 },
              { label: '30 dias', dias: 30 },
              { label: 'Mês atual', dias: -1 },
            ].map(({ label, dias }) => (
              <button
                key={label}
                onClick={() => {
                  const hoje = new Date()
                  let i: string, f: string
                  f = hoje.toISOString().split('T')[0]
                  if (dias === 0) {
                    i = f
                  } else if (dias === -1) {
                    i = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
                    f = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
                  } else {
                    const d = new Date(hoje)
                    d.setDate(d.getDate() - dias)
                    i = d.toISOString().split('T')[0]
                  }
                  setInicio(i)
                  setFim(f)
                  startTransition(() => router.push(`${pathname}?inicio=${i}&fim=${f}`))
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={aplicarFiltro}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Search size={13} />
            Aplicar
          </button>

          <div className="ml-auto">
            <button
              onClick={() => setDialogImpressao(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm print:hidden"
            >
              <Printer size={13} />
              Imprimir
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-3">
          Exibindo dados de <strong>{inicioPeriodo}</strong> até <strong>{fimPeriodo}</strong> — {vendasPorProduto.length} produto(s) vendido(s)
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-4" data-print-section="resumo">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Receita do Período</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{formatarMoeda(totais.totalReceita)}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <TrendingUp size={17} className="text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Total de Pedidos</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{totais.totalPedidos}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                🛵 {totais.pedidosIfood} iFood · 🏪 {totais.pedidosBalcao} Balcão
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <ShoppingBag size={17} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-rows-2 gap-2">
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Ticket Médio</p>
              <p className="text-lg font-bold text-slate-800">{formatarMoeda(totais.ticketMedio)}</p>
            </div>
            <BarChart3 size={18} className="text-slate-300" />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Itens Vendidos</p>
              <p className="text-lg font-bold text-slate-800">{totais.totalItens}</p>
            </div>
            <Layers size={18} className="text-slate-300" />
          </div>
        </div>
      </div>

      {/* Gráfico top 10 */}
      {top10.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm" data-print-section="grafico">
          <h3 className="font-semibold text-slate-700 text-sm mb-4">Top {top10.length} Produtos Mais Vendidos (quantidade)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={top10} layout="vertical" margin={{ left: 120, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis
                type="category"
                dataKey="nome_produto"
                tick={{ fontSize: 11, fill: '#475569' }}
                width={115}
                tickLine={false}
              />
              <Tooltip
                formatter={(v, name) =>
                  name === 'total_quantidade'
                    ? [`${v} un.`, 'Quantidade']
                    : [formatarMoeda(Number(v)), 'Receita']
                }
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="total_quantidade" name="total_quantidade" radius={[0, 4, 4, 0]}>
                {top10.map((_, i) => <Cell key={i} fill={CORES_GRAFICO[i % CORES_GRAFICO.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Abas ranking / estoque */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Aba selector */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setAbaAtiva('ranking')}
            className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold border-r border-slate-200 transition-all ${
              abaAtiva === 'ranking'
                ? 'bg-white text-slate-800 border-b-2 border-b-amber-500 -mb-px'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart3 size={14} />
            Ranking de Produtos
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-600 rounded-full">
              {vendasPorProduto.length}
            </span>
          </button>
          <button
            onClick={() => setAbaAtiva('estoque')}
            className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold transition-all ${
              abaAtiva === 'estoque'
                ? 'bg-white text-slate-800 border-b-2 border-b-amber-500 -mb-px'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Package2 size={14} />
            Status do Estoque
            {estoqueAlerta.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full">
                {estoqueAlerta.length} alerta(s)
              </span>
            )}
          </button>
        </div>

        {/* Ranking */}
        {abaAtiva === 'ranking' && (
          <div data-print-section="ranking">
            {/* Busca */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Buscar produto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="flex-1 text-sm border-none outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
              />
              {busca && (
                <button onClick={() => setBusca('')} className="text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-700 text-white text-[11px] uppercase tracking-wide">
                  <th className="text-center px-4 py-2.5 w-10">#</th>
                  <th className="text-left px-4 py-2.5">Produto</th>
                  <th className="text-right px-4 py-2.5">Preço Unit.</th>
                  <th className="text-center px-4 py-2.5">Qtd. Vendida</th>
                  <th className="text-right px-4 py-2.5">Receita Total</th>
                  <th className="text-right px-4 py-2.5">% da Receita</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((p, i) => {
                  const pct = totais.totalReceita > 0
                    ? ((p.total_receita / totais.totalReceita) * 100).toFixed(1)
                    : '0.0'
                  return (
                    <tr key={p.produto_id ?? p.nome_produto} className={`border-b border-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                      <td className="px-4 py-2.5 text-center">
                        {i < 3
                          ? <span className="font-black text-sm">{['🥇','🥈','🥉'][i]}</span>
                          : <span className="text-slate-400 text-xs font-bold">{i + 1}</span>
                        }
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800 text-sm">{p.nome_produto}</td>
                      <td className="px-4 py-2.5 text-right text-sm text-slate-500">{formatarMoeda(p.preco_unitario)}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="font-bold text-slate-800">{p.total_quantidade}</span>
                        <span className="text-slate-400 text-xs ml-1">un.</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-emerald-600">{formatarMoeda(p.total_receita)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 w-9 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!produtosFiltrados.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                      {busca ? `Nenhum produto encontrado para "${busca}"` : 'Nenhuma venda no período selecionado'}
                    </td>
                  </tr>
                )}
              </tbody>
              {produtosFiltrados.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-800 text-white text-sm">
                    <td className="px-4 py-2.5" colSpan={3}><span className="font-semibold">Total</span></td>
                    <td className="px-4 py-2.5 text-center font-bold">{totais.totalItens} un.</td>
                    <td className="px-4 py-2.5 text-right font-bold text-emerald-400">{formatarMoeda(totais.totalReceita)}</td>
                    <td className="px-4 py-2.5 text-right font-bold">100%</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* Estoque */}
        {abaAtiva === 'estoque' && (
          <div data-print-section="estoque">
            {estoqueAlerta.length > 0 && (
              <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span><strong>{estoqueAlerta.length}</strong> produto(s) com estoque abaixo do mínimo</span>
              </div>
            )}
            <table className="w-full mt-2">
              <thead>
                <tr className="bg-slate-700 text-white text-[11px] uppercase tracking-wide">
                  <th className="text-left px-4 py-2.5">Produto</th>
                  <th className="text-left px-4 py-2.5">Categoria</th>
                  <th className="text-center px-4 py-2.5">Estoque Atual</th>
                  <th className="text-center px-4 py-2.5">Mínimo</th>
                  <th className="text-center px-4 py-2.5">Situação</th>
                </tr>
              </thead>
              <tbody>
                {[...estoqueAlerta, ...estoqueOk].map((e, i) => {
                  const alerta = e.estoque_atual <= e.estoque_minimo
                  return (
                    <tr key={e.id} className={`border-b border-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                      <td className="px-4 py-2.5 font-semibold text-slate-800 text-sm">{e.nome}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">{e.categoria?.nome ?? '—'}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-lg font-black ${alerta ? 'text-red-600' : 'text-slate-700'}`}>
                          {e.estoque_atual}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center text-sm text-slate-400">{e.estoque_minimo}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          alerta
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {alerta ? '⚠ Estoque Baixo' : '✓ OK'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {!estoque.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                      Nenhum produto com controle de estoque ativado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog de impressão */}
      {dialogImpressao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Printer size={18} className="text-slate-700" />
                <h3 className="font-bold text-slate-800">Opções de Impressão</h3>
              </div>
              <button
                onClick={() => setDialogImpressao(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-1">
              <p className="text-sm text-slate-500 mb-4">
                Período: <strong>{inicioPeriodo}</strong> a <strong>{fimPeriodo}</strong>
                <br />Selecione as seções a incluir no relatório:
              </p>
              {SECOES.map((s) => (
                <label
                  key={s.key}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                  onClick={() => setCampos((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                    campos[s.key] ? 'bg-slate-800 border-slate-800' : 'border-slate-300 bg-white group-hover:border-slate-400'
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

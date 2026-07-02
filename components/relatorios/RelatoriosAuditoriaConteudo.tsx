'use client'

import { useState } from 'react'

import { X } from 'lucide-react'

import { FiltroRelatorio } from './FiltroRelatorio'
import type { Auditoria } from '@/types/database'

const ACAO_LABEL: Record<string, { label: string; cor: string }> = {
  cadastro:       { label: 'Cadastro',   cor: 'bg-emerald-100 text-emerald-700' },
  edicao:         { label: 'Edição',     cor: 'bg-blue-100 text-blue-700' },
  exclusao:       { label: 'Exclusão',   cor: 'bg-red-100 text-red-700' },
  inativacao:     { label: 'Inativação', cor: 'bg-amber-100 text-amber-700' },
  ativacao:       { label: 'Ativação',   cor: 'bg-teal-100 text-teal-700' },
  ajuste_estoque: { label: 'Ajuste de estoque', cor: 'bg-purple-100 text-purple-700' },
}

interface Props {
  registros: Auditoria[]
  inicioPeriodo: string
  fimPeriodo: string
}

export function RelatoriosAuditoriaConteudo({ registros, inicioPeriodo, fimPeriodo }: Props) {
  const [inicio, setInicio] = useState(inicioPeriodo)
  const [fim, setFim] = useState(fimPeriodo)
  const [filtroTela, setFiltroTela] = useState('todas')
  const [filtroAcao, setFiltroAcao] = useState('todas')
  const [detalhe, setDetalhe] = useState<Auditoria | null>(null)

  const telas = Array.from(new Set(registros.map((r) => r.tela))).sort()

  const filtrados = registros.filter((r) => {
    if (filtroTela !== 'todas' && r.tela !== filtroTela) return false
    if (filtroAcao !== 'todas' && r.acao !== filtroAcao) return false
    return true
  })

  return (
    <div className="space-y-5">
      <FiltroRelatorio inicio={inicio} fim={fim} setInicio={setInicio} setFim={setFim} extraParams={{}}>
        <div className="flex flex-col gap-1 self-end">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Tela</span>
          <select
            value={filtroTela}
            onChange={(e) => setFiltroTela(e.target.value)}
            className="h-8 px-3 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="todas">Todas as telas</option>
            {telas.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 self-end">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Ação</span>
          <select
            value={filtroAcao}
            onChange={(e) => setFiltroAcao(e.target.value)}
            className="h-8 px-3 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="todas">Todas as ações</option>
            {Object.entries(ACAO_LABEL).map(([v, a]) => <option key={v} value={v}>{a.label}</option>)}
          </select>
        </div>
      </FiltroRelatorio>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
          <h3 className="font-semibold text-slate-700 text-sm">Registros de auditoria</h3>
          <span className="text-xs text-slate-400">{filtrados.length} registro(s)</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700 text-white text-[11px] uppercase tracking-wide">
              <th className="text-left px-4 py-2.5">Data/Hora</th>
              <th className="text-left px-4 py-2.5">Usuário</th>
              <th className="text-left px-4 py-2.5">Tela</th>
              <th className="text-center px-4 py-2.5">Ação</th>
              <th className="text-left px-4 py-2.5">Tabela</th>
              <th className="text-left px-4 py-2.5">IP</th>
              <th className="text-center px-4 py-2.5">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((r, i) => (
              <tr key={r.id} className={`border-b border-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">
                  {new Date(r.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-2.5 text-sm text-slate-700">{r.usuario_email ?? '—'}</td>
                <td className="px-4 py-2.5 text-sm text-slate-600">{r.tela}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ACAO_LABEL[r.acao]?.cor ?? 'bg-slate-100 text-slate-600'}`}>
                    {ACAO_LABEL[r.acao]?.label ?? r.acao}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">{r.tabela}</td>
                <td className="px-4 py-2.5 text-xs text-slate-400 font-mono">{r.ip ?? '—'}</td>
                <td className="px-4 py-2.5 text-center">
                  <button
                    onClick={() => setDetalhe(r)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
            {!filtrados.length && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">Nenhum registro de auditoria no período</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {detalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="font-bold text-slate-800">Detalhes da alteração</h3>
              <button onClick={() => setDetalhe(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3 text-sm">
              <p><strong>Usuário:</strong> {detalhe.usuario_email ?? '—'}</p>
              <p><strong>Data/Hora:</strong> {new Date(detalhe.created_at).toLocaleString('pt-BR')}</p>
              <p><strong>Tela:</strong> {detalhe.tela}</p>
              <p><strong>Ação:</strong> {ACAO_LABEL[detalhe.acao]?.label ?? detalhe.acao}</p>
              <p><strong>Tabela/Registro:</strong> {detalhe.tabela} / {detalhe.registro_id ?? '—'}</p>
              <p><strong>IP:</strong> {detalhe.ip ?? '—'}</p>
              <p><strong>Navegador/SO:</strong> <span className="text-xs text-slate-500 break-all">{detalhe.user_agent ?? '—'}</span></p>
              {detalhe.dados_antes && (
                <div>
                  <p className="font-semibold mb-1">Antes:</p>
                  <pre className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-auto">{JSON.stringify(detalhe.dados_antes, null, 2)}</pre>
                </div>
              )}
              {detalhe.dados_depois && (
                <div>
                  <p className="font-semibold mb-1">Depois:</p>
                  <pre className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-auto">{JSON.stringify(detalhe.dados_depois, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, Filter } from 'lucide-react'

interface Atalho { label: string; dias: number }

const ATALHOS: Atalho[] = [
  { label: 'Hoje',     dias: 0  },
  { label: '7 dias',   dias: 7  },
  { label: '30 dias',  dias: 30 },
  { label: 'Mês atual', dias: -1 },
  { label: 'Trimestre', dias: -3 },
]

interface Props {
  inicio: string
  fim: string
  setInicio: (v: string) => void
  setFim: (v: string) => void
  extraParams?: Record<string, string>
  children?: React.ReactNode
}

export function FiltroRelatorio({ inicio, fim, setInicio, setFim, extraParams = {}, children }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  function navegar(i: string, f: string, extra = extraParams) {
    const qs = new URLSearchParams({ inicio: i, fim: f, ...extra }).toString()
    startTransition(() => router.push(`${pathname}?${qs}`))
  }

  function aplicarAtalho(dias: number) {
    const hoje = new Date()
    let i: string, f: string
    f = hoje.toISOString().split('T')[0]
    if (dias === 0) {
      i = f
    } else if (dias === -1) {
      i = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
      f = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
    } else if (dias === -3) {
      i = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1).toISOString().split('T')[0]
      f = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
    } else {
      const d = new Date(hoje)
      d.setDate(d.getDate() - dias)
      i = d.toISOString().split('T')[0]
    }
    setInicio(i)
    setFim(f)
    navegar(i, f)
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
        <Filter size={13} />
        Filtros
      </div>

      <div className="flex items-end flex-wrap gap-3">
        {/* Período */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">De</label>
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="h-8 px-3 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <div className="flex flex-col gap-1 mt-auto">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Até</label>
            <input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              className="h-8 px-3 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Atalhos */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Período rápido</span>
          <div className="flex gap-1.5 flex-wrap">
            {ATALHOS.map((a) => (
              <button
                key={a.label}
                onClick={() => aplicarAtalho(a.dias)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros extras (slot) */}
        {children}

        <button
          onClick={() => navegar(inicio, fim)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors shadow-sm self-end"
        >
          <Search size={13} />
          Aplicar
        </button>
      </div>
    </div>
  )
}

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export type BotaoToolbar =
  | { separator: true }
  | {
      label: string
      icon: LucideIcon
      onClick: () => void
      variante?: 'default' | 'primary' | 'danger' | 'success' | 'warning'
      disabled?: boolean
      separator?: false
    }

interface Props {
  botoes: BotaoToolbar[]
  titulo?: string
}

const varianteCss: Record<string, string> = {
  default: 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50 hover:text-slate-900',
  primary: 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100',
  danger:  'text-red-700 bg-red-50 border-red-200 hover:bg-red-100',
  success: 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
  warning: 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100',
}

export function BarraFerramentas({ botoes, titulo }: Props) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 border-b border-slate-300 px-2 py-1.5 print:hidden">
      {titulo && (
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 mr-1 border-r border-slate-300 pr-4">
          {titulo}
        </span>
      )}
      {botoes.map((btn, i) =>
        btn.separator ? (
          <div key={i} className="w-px h-7 bg-slate-300 mx-1" />
        ) : (
          <button
            key={i}
            onClick={btn.onClick}
            disabled={btn.disabled}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded border text-[11px] font-semibold transition-all min-w-14',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
              varianteCss[btn.variante ?? 'default']
            )}
          >
            <btn.icon size={16} strokeWidth={2} />
            {btn.label}
          </button>
        )
      )}
    </div>
  )
}

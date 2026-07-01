import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface BotaoToolbar {
  label: string
  icon: LucideIcon
  onClick: () => void
  variante?: 'default' | 'primary' | 'danger' | 'success' | 'warning'
  disabled?: boolean
  separator?: boolean
}

interface Props {
  botoes: BotaoToolbar[]
  titulo?: string
}

const varianteCss = {
  default:  'text-slate-600 hover:bg-slate-200 hover:text-slate-800 border-transparent',
  primary:  'text-blue-700 hover:bg-blue-100 border-transparent',
  danger:   'text-red-600 hover:bg-red-100 border-transparent',
  success:  'text-emerald-700 hover:bg-emerald-100 border-transparent',
  warning:  'text-amber-600 hover:bg-amber-100 border-transparent',
}

export function BarraFerramentas({ botoes, titulo }: Props) {
  return (
    <div className="flex items-center gap-0 bg-slate-100 border-b border-slate-300 px-2 py-1 rounded-t-lg">
      {titulo && (
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 mr-2 border-r border-slate-300 pr-4">{titulo}</span>
      )}
      {botoes.map((btn, i) => (
        btn.separator
          ? <div key={i} className="w-px h-6 bg-slate-300 mx-1" />
          : (
            <button
              key={i}
              onClick={btn.onClick}
              disabled={btn.disabled}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded text-[11px] font-medium transition-all border disabled:opacity-40 disabled:cursor-not-allowed min-w-12',
                varianteCss[btn.variante ?? 'default']
              )}
            >
              <btn.icon size={16} strokeWidth={1.8} />
              {btn.label}
            </button>
          )
      ))}
    </div>
  )
}

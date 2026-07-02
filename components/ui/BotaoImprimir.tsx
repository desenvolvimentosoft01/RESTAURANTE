'use client'

import { Printer } from 'lucide-react'

import { cn } from '@/lib/utils'

// Imprime a tela atual (window.print). Navegação, barras de filtro e o
// próprio botão são ocultados na impressão via print:hidden/globals.css.
export function BotaoImprimir({ className }: { className?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className={cn(
        'h-9 flex items-center gap-1.5 px-4 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors print:hidden',
        className
      )}
    >
      <Printer size={13} />
      Imprimir
    </button>
  )
}

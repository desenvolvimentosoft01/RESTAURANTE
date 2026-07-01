'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { useTabs } from '@/hooks/useTabs'
import { cn } from '@/lib/utils'

export function TabBar() {
  const router = useRouter()
  const pathname = usePathname()
  const { abas, abaAtiva, setAbaAtiva, fecharAba } = useTabs()

  // Sincroniza a aba ativa com a rota atual
  useEffect(() => {
    const abaExiste = abas.find((a) => a.href === pathname)
    if (abaExiste) {
      setAbaAtiva(pathname)
    }
  }, [pathname, abas, setAbaAtiva])

  function clicarAba(href: string) {
    setAbaAtiva(href)
    router.push(href)
  }

  function fechar(e: React.MouseEvent, href: string) {
    e.stopPropagation()
    const { abas: abasAtuais, abaAtiva: ativa, fecharAba: fn } = useTabs.getState()

    // Calcula para onde navegar antes de fechar
    if (href === ativa && abasAtuais.length > 1) {
      const idx = abasAtuais.findIndex((a) => a.href === href)
      const novasAbas = abasAtuais.filter((a) => a.href !== href)
      const proximaHref = novasAbas[Math.max(0, idx - 1)].href
      fn(href)
      router.push(proximaHref)
    } else {
      fn(href)
    }
  }

  if (abas.length === 0) return null

  return (
    <div className="flex items-end gap-0 overflow-x-auto bg-slate-800 px-2 pt-1 shrink-0 scrollbar-none border-b border-slate-700">
      {abas.map((aba) => {
        const ativa = aba.href === abaAtiva
        return (
          <div
            key={aba.href}
            onClick={() => clicarAba(aba.href)}
            className={cn(
              'group flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium cursor-pointer',
              'rounded-t-md border-t border-l border-r transition-all shrink-0 select-none',
              'max-w-[180px]',
              ativa
                ? 'bg-slate-100 text-slate-800 border-slate-300 border-b-slate-100 -mb-px z-10'
                : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-white'
            )}
          >
            <span className="text-[13px] leading-none">{aba.icone}</span>
            <span className="truncate flex-1">{aba.label}</span>
            {abas.length > 1 && (
              <button
                onClick={(e) => fechar(e, aba.href)}
                className={cn(
                  'w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors',
                  ativa
                    ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                    : 'text-slate-500 hover:text-white hover:bg-slate-500 opacity-0 group-hover:opacity-100'
                )}
              >
                <X size={10} strokeWidth={2.5} />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

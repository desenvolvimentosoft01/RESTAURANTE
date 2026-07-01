'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Bell, ChevronRight, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

const NOMES_ROTAS: Record<string, string> = {
  '':                         'Dashboard',
  'venda-balcao':             'Venda Balcão',
  'pedidos':                  'Pedidos iFood',
  'produtos':                 'Produtos',
  'novo':                     'Novo',
  'editar':                   'Editar',
  'categorias':               'Categorias',
  'nova':                     'Nova',
  'estoque':                  'Estoque',
  'financeiro':               'Financeiro',
  'contas':                   'Contas',
  'relatorios':               'Relatórios',
}

interface TopBarProps {
  userEmail?: string
  alertas?: number
}

export function TopBar({ userEmail, alertas = 0 }: TopBarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const segmentos = pathname.split('/').filter(Boolean)
  const migalhas = segmentos
    .filter((s) => !s.match(/^[0-9a-f-]{36}$/)) // remove UUIDs
    .map((s, i, arr) => ({
      label: NOMES_ROTAS[s] ?? s,
      href: '/' + arr.slice(0, i + 1).join('/'),
    }))

  async function sair() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <a href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
          <Home size={14} />
        </a>
        {migalhas.map((m, i) => (
          <span key={m.href} className="flex items-center gap-1.5">
            <ChevronRight size={13} className="text-slate-300" />
            {i === migalhas.length - 1 ? (
              <span className="font-semibold text-slate-700">{m.label}</span>
            ) : (
              <a href={m.href} className="text-slate-400 hover:text-slate-600 transition-colors">{m.label}</a>
            )}
          </span>
        ))}
        {migalhas.length === 0 && (
          <span className="font-semibold text-slate-700">Dashboard</span>
        )}
      </nav>

      {/* Direita */}
      <div className="flex items-center gap-3">
        {alertas > 0 && (
          <a href="/produtos/estoque" className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <Bell size={17} />
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-0.5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
              {alertas}
            </span>
          </a>
        )}

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center">
            <span className="text-white text-xs font-bold uppercase">
              {userEmail?.[0] ?? 'U'}
            </span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:block max-w-36 truncate">{userEmail}</span>
        </div>

        <button
          onClick={sair}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-slate-200 hover:border-red-200"
        >
          <LogOut size={13} />
          Sair
        </button>
      </div>
    </header>
  )
}

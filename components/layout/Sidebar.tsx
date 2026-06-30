'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ItemMenu {
  href: string
  label: string
  badge?: number
}

interface SidebarProps {
  alertasEstoque?: number
}

export function Sidebar({ alertasEstoque = 0 }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const itensMenu: ItemMenu[] = [
    { href: '/', label: 'Dashboard' },
    { href: '/pdv', label: 'PDV' },
    { href: '/pedidos', label: 'Pedidos' },
    { href: '/cardapio', label: 'Cardápio' },
    { href: '/estoque', label: 'Estoque', badge: alertasEstoque },
    { href: '/financeiro', label: 'Financeiro' },
    { href: '/relatorios', label: 'Relatórios' },
  ]

  async function sair() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 p-4 flex flex-col">
      <h1 className="text-xl font-bold text-slate-800 mb-6">🍽️ Restaurante</h1>
      <nav className="space-y-1 flex-1">
        {itensMenu.map((item) => {
          const ativo = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors',
                ativo
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              )}
            >
              <span>{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="ml-2 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>
      <button
        onClick={sair}
        className="px-3 py-2 rounded-md text-sm text-slate-500 hover:bg-slate-100 text-left"
      >
        Sair
      </button>
    </aside>
  )
}

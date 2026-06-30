'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const ITENS_MENU = [
  { href: '/', label: 'Dashboard' },
  { href: '/pdv', label: 'PDV' },
  { href: '/pedidos', label: 'Pedidos' },
  { href: '/cardapio', label: 'Cardápio' },
  { href: '/estoque', label: 'Estoque' },
  { href: '/financeiro', label: 'Financeiro' },
  { href: '/relatorios', label: 'Relatórios' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

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
        {ITENS_MENU.map((item) => {
          const ativo = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-3 py-2 rounded-md text-sm transition-colors',
                ativo
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              )}
            >
              {item.label}
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

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  BookOpen,
  Package,
  DollarSign,
  BarChart3,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ItemMenu {
  href: string
  label: string
  icon: React.ElementType
  badge?: number
}

interface SidebarProps {
  alertasEstoque?: number
}

export function Sidebar({ alertasEstoque = 0 }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const itensMenu: ItemMenu[] = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pdv', label: 'PDV', icon: ShoppingCart },
    { href: '/pedidos', label: 'Pedidos', icon: ClipboardList },
    { href: '/cardapio', label: 'Cardápio', icon: BookOpen },
    { href: '/estoque', label: 'Estoque', icon: Package, badge: alertasEstoque },
    { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
    { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  ]

  async function sair() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 p-4 flex flex-col">
      <div className="mb-8 px-2">
        <h1 className="text-white font-bold text-lg tracking-tight">🍽️ Restaurante</h1>
        <p className="text-slate-400 text-xs mt-0.5">Sistema de Gestão</p>
      </div>

      <nav className="space-y-1 flex-1">
        {itensMenu.map((item) => {
          const Icon = item.icon
          const ativo = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                ativo
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon size={18} />
              <span className="flex-1">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={sair}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all w-full"
      >
        <LogOut size={18} />
        <span>Sair</span>
      </button>
    </aside>
  )
}

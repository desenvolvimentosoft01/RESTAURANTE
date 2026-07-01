'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Bike,
  UtensilsCrossed,
  Layers,
  Warehouse,
  Wallet,
  BarChart3,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ItemSimples {
  tipo: 'link'
  href: string
  label: string
  icon: React.ElementType
  badge?: number
}

interface ItemGrupo {
  tipo: 'grupo'
  label: string
  icon: React.ElementType
  filhos: { href: string; label: string }[]
}

type Item = ItemSimples | ItemGrupo

interface SidebarProps {
  alertasEstoque?: number
}

export function Sidebar({ alertasEstoque = 0 }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [gruposAbertos, setGruposAbertos] = useState<string[]>(['Produtos', 'Financeiro'])

  const toggleGrupo = (label: string) =>
    setGruposAbertos((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    )

  const menu: Item[] = [
    { tipo: 'link', href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { tipo: 'link', href: '/venda-balcao', label: 'Venda Balcão', icon: ShoppingCart },
    { tipo: 'link', href: '/pedidos', label: 'Pedidos iFood', icon: Bike },
    {
      tipo: 'grupo',
      label: 'Produtos',
      icon: UtensilsCrossed,
      filhos: [
        { href: '/produtos', label: 'Cadastro de Produtos' },
        { href: '/produtos/categorias', label: 'Categorias' },
        { href: '/produtos/estoque', label: 'Estoque', },
      ],
    },
    {
      tipo: 'grupo',
      label: 'Financeiro',
      icon: Wallet,
      filhos: [
        { href: '/financeiro/contas', label: 'Contas' },
        { href: '/financeiro/relatorios', label: 'Relatórios' },
      ],
    },
  ]

  async function sair() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 p-4 flex flex-col shrink-0">
      <div className="mb-8 px-2">
        <h1 className="text-white font-bold text-lg tracking-tight">🍽️ Restaurante</h1>
        <p className="text-slate-400 text-xs mt-0.5">Sistema de Gestão</p>
      </div>

      <nav className="space-y-1 flex-1">
        {menu.map((item) => {
          if (item.tipo === 'link') {
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
                <Icon size={17} />
                <span className="flex-1">{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            )
          }

          // Grupo
          const Icon = item.icon
          const aberto = gruposAbertos.includes(item.label)
          const grupoAtivo = item.filhos.some((f) => pathname === f.href || pathname.startsWith(f.href + '/'))

          return (
            <div key={item.label}>
              <button
                onClick={() => toggleGrupo(item.label)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  grupoAtivo
                    ? 'text-white bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon size={17} />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown
                  size={14}
                  className={cn('transition-transform', aberto && 'rotate-180')}
                />
              </button>

              {aberto && (
                <div className="ml-8 mt-1 space-y-0.5 border-l border-slate-700 pl-3">
                  {item.filhos.map((filho) => {
                    const ativo = pathname === filho.href || pathname.startsWith(filho.href + '/')
                    return (
                      <Link
                        key={filho.href}
                        href={filho.href}
                        className={cn(
                          'block px-2 py-2 rounded-md text-xs font-medium transition-all',
                          ativo
                            ? 'text-white bg-slate-700'
                            : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                        )}
                      >
                        {filho.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <button
        onClick={sair}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all w-full"
      >
        <LogOut size={17} />
        <span>Sair</span>
      </button>
    </aside>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Bike,
  UtensilsCrossed,
  Wallet,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ItemSimples {
  tipo: 'link'
  href: string
  label: string
  icon: React.ElementType
}

interface ItemGrupo {
  tipo: 'grupo'
  label: string
  icon: React.ElementType
  filhos: { href: string; label: string }[]
}

type Item = ItemSimples | ItemGrupo

const menu: Item[] = [
  { tipo: 'link', href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { tipo: 'link', href: '/venda-balcao', label: 'Venda Balcão', icon: ShoppingCart },
  { tipo: 'link', href: '/pedidos', label: 'Pedidos iFood', icon: Bike },
  {
    tipo: 'grupo',
    label: 'Produtos',
    icon: UtensilsCrossed,
    filhos: [
      { href: '/produtos', label: 'Cadastro' },
      { href: '/produtos/categorias', label: 'Categorias' },
      { href: '/produtos/estoque', label: 'Estoque' },
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

export function Sidebar() {
  const pathname = usePathname()
  const [gruposAbertos, setGruposAbertos] = useState<string[]>(['Produtos', 'Financeiro'])

  const toggleGrupo = (label: string) =>
    setGruposAbertos((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    )

  return (
    <aside className="w-56 min-h-screen bg-slate-900 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold text-sm">R</div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Restaurante</p>
            <p className="text-slate-400 text-[10px]">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {menu.map((item) => {
          if (item.tipo === 'link') {
            const Icon = item.icon
            const ativo = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
                  ativo
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            )
          }

          const Icon = item.icon
          const aberto = gruposAbertos.includes(item.label)
          const grupoAtivo = item.filhos.some(
            (f) => pathname === f.href || pathname.startsWith(f.href + '/')
          )

          return (
            <div key={item.label}>
              <button
                onClick={() => toggleGrupo(item.label)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
                  grupoAtivo ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon size={15} />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown size={12} className={cn('transition-transform text-slate-500', aberto && 'rotate-180')} />
              </button>

              {aberto && (
                <div className="ml-6 mt-0.5 mb-1 border-l border-slate-700 pl-3 space-y-0.5">
                  {item.filhos.map((filho) => {
                    // Ativo apenas se: match exato OU começa com href/ E nenhum irmão cobre melhor
                    const ativo =
                      pathname === filho.href ||
                      (pathname.startsWith(filho.href + '/') &&
                        !item.filhos.some(
                          (outro) =>
                            outro.href !== filho.href &&
                            (pathname === outro.href || pathname.startsWith(outro.href + '/'))
                        ))
                    return (
                      <Link
                        key={filho.href}
                        href={filho.href}
                        className={cn(
                          'block px-2 py-1.5 rounded-md text-[12px] font-medium transition-all',
                          ativo
                            ? 'text-amber-400 bg-slate-800'
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

      <div className="px-4 py-3 border-t border-slate-800">
        <p className="text-[10px] text-slate-600 text-center">ERP v1.0</p>
      </div>
    </aside>
  )
}

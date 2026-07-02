'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { BarChart3, Bike, ChevronDown, LayoutDashboard, ShoppingCart, UtensilsCrossed, Wallet } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useTabs, type Aba } from '@/hooks/useTabs'

interface ItemSimples {
  tipo: 'link'
  href: string
  label: string
  icon: React.ElementType
  icone: string
}

interface ItemGrupo {
  tipo: 'grupo'
  label: string
  icon: React.ElementType
  filhos: { href: string; label: string; icone: string }[]
}

type Item = ItemSimples | ItemGrupo

const menu: Item[] = [
  { tipo: 'link', href: '/',             label: 'Dashboard',    icon: LayoutDashboard, icone: '📊' },
  { tipo: 'link', href: '/venda-balcao', label: 'Venda Balcão', icon: ShoppingCart,    icone: '🏪' },
  { tipo: 'link', href: '/pedidos',      label: 'Pedidos iFood', icon: Bike,           icone: '🛵' },
  {
    tipo: 'grupo',
    label: 'Produtos',
    icon: UtensilsCrossed,
    filhos: [
      { href: '/produtos',            label: 'Cadastro de Produtos', icone: '🍽️' },
      { href: '/produtos/categorias', label: 'Categorias',           icone: '🏷️' },
      { href: '/produtos/estoque',    label: 'Estoque',              icone: '📦' },
      { href: '/produtos/inativos',   label: 'Produtos Inativos',    icone: '🚫' },
    ],
  },
  {
    tipo: 'grupo',
    label: 'Financeiro',
    icon: Wallet,
    filhos: [
      { href: '/financeiro/contas', label: 'Contas', icone: '💰' },
    ],
  },
  {
    tipo: 'grupo',
    label: 'Relatórios',
    icon: BarChart3,
    filhos: [
      { href: '/relatorios/vendas',   label: 'Vendas',       icone: '📊' },
      { href: '/relatorios/contas',   label: 'Contas',       icone: '📋' },
      { href: '/produtos/relatorios', label: 'Produtos',     icone: '🍽️' },
      { href: '/financeiro/relatorios', label: 'Financeiro', icone: '📈' },
      { href: '/relatorios/auditoria', label: 'Auditoria',   icone: '🔎' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { abrirAba } = useTabs()
  const [gruposAbertos, setGruposAbertos] = useState<string[]>(['Produtos', 'Financeiro', 'Relatórios'])

  const toggleGrupo = (label: string) =>
    setGruposAbertos((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    )

  function navegar(aba: Aba) {
    abrirAba(aba)
    router.push(aba.href)
  }

  return (
    <aside className="w-56 min-h-screen bg-slate-900 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0">R</div>
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
              <button
                key={item.href}
                onClick={() => navegar({ href: item.href, label: item.label, icone: item.icone })}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
                  ativo
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon size={15} />
                {item.label}
              </button>
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
                    const ativo =
                      pathname === filho.href ||
                      (pathname.startsWith(filho.href + '/') &&
                        !item.filhos.some(
                          (outro) =>
                            outro.href !== filho.href &&
                            (pathname === outro.href || pathname.startsWith(outro.href + '/'))
                        ))
                    return (
                      <button
                        key={filho.href}
                        onClick={() => navegar({ href: filho.href, label: filho.label, icone: filho.icone })}
                        className={cn(
                          'w-full text-left block px-2 py-1.5 rounded-md text-[12px] font-medium transition-all',
                          ativo
                            ? 'text-amber-400 bg-slate-800'
                            : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                        )}
                      >
                        {filho.label}
                      </button>
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

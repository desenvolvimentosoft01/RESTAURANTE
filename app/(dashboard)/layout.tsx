import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar — implementar em components/layout/Sidebar.tsx */}
        <aside className="w-64 min-h-screen bg-white border-r border-slate-200 p-4">
          <h1 className="text-xl font-bold text-slate-800 mb-6">🍽️ Restaurante</h1>
          <nav className="space-y-1">
            {[
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/dashboard/pdv', label: 'PDV' },
              { href: '/dashboard/pedidos', label: 'Pedidos' },
              { href: '/dashboard/cardapio', label: 'Cardápio' },
              { href: '/dashboard/estoque', label: 'Estoque' },
              { href: '/dashboard/financeiro', label: 'Financeiro' },
              { href: '/dashboard/relatorios', label: 'Relatórios' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

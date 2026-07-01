import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { TabBar } from '@/components/layout/TabBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Dupla verificação além do middleware — garante que Server Components filhos
  // nunca recebam dados de um usuário não autenticado mesmo em edge cases de cache.
  if (!user) redirect('/login')

  // Busca apenas os IDs para mínimo de tráfego — só o count importa aqui.
  const { data: alertas } = await supabase.from('alertas_estoque').select('id')
  const totalAlertas = alertas?.length ?? 0

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userEmail={user.email} alertas={totalAlertas} />
        <TabBar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

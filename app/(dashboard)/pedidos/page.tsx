import { createClient } from '@/lib/supabase/server'
import { PedidosWrapper } from '@/components/pedidos/PedidosWrapper'

export default async function PedidosPage() {
  const supabase = await createClient()

  const hoje = new Date().toISOString().split('T')[0]

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('*, itens:itens_pedido(*)')
    .gte('created_at', hoje)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pedidos</h1>
        <p className="text-slate-500 text-sm mt-1">Pedidos de hoje em tempo real</p>
      </div>
      <PedidosWrapper inicial={pedidos ?? []} />
    </div>
  )
}

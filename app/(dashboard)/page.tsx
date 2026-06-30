import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatarMoeda, formatarData } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [resResumo, resPedidos, resAlertas] = await Promise.all([
    supabase.from('resumo_financeiro_hoje').select('*').single(),
    supabase
      .from('pedidos')
      .select('id, status, total, created_at, origem')
      .eq('created_at::date', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('alertas_estoque').select('nome'),
  ])

  const resumo = resResumo.data
  const pedidos = resPedidos.data ?? []
  const alertas = resAlertas.data ?? []

  const STATUS_LABEL: Record<string, string> = {
    pendente: 'Pendente',
    confirmado: 'Confirmado',
    em_preparo: 'Em preparo',
    pronto: 'Pronto',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Resumo do dia de hoje</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Entradas hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatarMoeda(resumo?.total_entradas ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Saídas hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatarMoeda(resumo?.total_saidas ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Saldo hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${(resumo?.saldo ?? 0) >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
              {formatarMoeda(resumo?.saldo ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {alertas.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-3">
            <p className="text-sm text-red-700">
              <span className="font-semibold">⚠ Estoque baixo:</span>{' '}
              {alertas.map((a) => a.nome).join(', ')}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimos pedidos do dia</CardTitle>
        </CardHeader>
        <CardContent>
          {pedidos.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum pedido registrado hoje.</p>
          ) : (
            <div className="space-y-2">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      {pedido.origem === 'ifood' ? '🛵 iFood' : '🏪 Balcão'}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">{formatarData(pedido.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{STATUS_LABEL[pedido.status]}</Badge>
                    <span className="text-sm font-semibold">{formatarMoeda(pedido.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

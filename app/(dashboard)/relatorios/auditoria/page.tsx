import { createClient } from '@/lib/supabase/server'
import { RelatoriosAuditoriaConteudo } from '@/components/relatorios/RelatoriosAuditoriaConteudo'

interface PageProps {
  searchParams: Promise<{ inicio?: string; fim?: string }>
}

export default async function RelatoriosAuditoriaPage({ searchParams }: PageProps) {
  const { inicio, fim } = await searchParams
  const supabase = await createClient()

  const hoje = new Date()
  const inicioDefault = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
  const fimDefault    = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
  const inicioPeriodo = inicio ?? inicioDefault
  const fimPeriodo    = fim    ?? fimDefault
  const inicioTs = `${inicioPeriodo}T00:00:00`
  const fimTs    = `${fimPeriodo}T23:59:59`

  const { data: registros } = await supabase
    .from('auditoria')
    .select('*')
    .gte('created_at', inicioTs)
    .lte('created_at', fimTs)
    .order('created_at', { ascending: false })
    .limit(500)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Auditoria do Sistema</h1>
        <p className="text-xs text-slate-500 mt-0.5">Histórico de cadastros, alterações, exclusões e ajustes realizados no sistema</p>
      </div>
      <RelatoriosAuditoriaConteudo
        registros={registros ?? []}
        inicioPeriodo={inicioPeriodo}
        fimPeriodo={fimPeriodo}
      />
    </div>
  )
}

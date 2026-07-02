import Link from 'next/link'

import { Plus } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { ContasConteudo } from '@/components/financeiro/ContasConteudo'
import { Button } from '@/components/ui/button'

export default async function ContasPage() {
  const supabase = await createClient()

  const { data: contas } = await supabase
    .from('contas')
    .select('*')
    .order('vencimento')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Contas</h1>
          <p className="text-sm text-slate-500 mt-0.5">Contas a pagar e a receber</p>
        </div>
        <Button asChild>
          <Link href="/financeiro/contas/nova">
            <Plus size={16} className="mr-2" />
            Nova Conta
          </Link>
        </Button>
      </div>

      <ContasConteudo contas={contas ?? []} />
    </div>
  )
}

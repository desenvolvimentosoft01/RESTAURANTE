import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FormularioConta } from '@/components/financeiro/FormularioConta'

export default async function EditarContaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: conta } = await supabase.from('contas').select('*').eq('id', id).single()
  if (!conta) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/financeiro/contas" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Editar Conta</h1>
          <p className="text-sm text-slate-500 mt-0.5">{conta.descricao}</p>
        </div>
      </div>
      <FormularioConta conta={conta} />
    </div>
  )
}

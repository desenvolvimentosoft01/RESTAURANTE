import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FormularioProduto } from '@/components/produtos/FormularioProduto'

export default async function NovoProdutoPage() {
  const supabase = await createClient()
  const { data: categorias } = await supabase
    .from('categorias')
    .select('*')
    .eq('ativo', true)
    .order('ordem')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/produtos" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Novo Produto</h1>
          <p className="text-sm text-slate-500 mt-0.5">Preencha os dados do produto</p>
        </div>
      </div>
      <FormularioProduto categorias={categorias ?? []} />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FormularioProduto } from '@/components/produtos/FormularioProduto'

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: produto }, { data: categorias }] = await Promise.all([
    supabase.from('produtos').select('*').eq('id', id).single(),
    supabase.from('categorias').select('*').eq('ativo', true).order('ordem'),
  ])

  if (!produto) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/produtos" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Editar Produto</h1>
          <p className="text-sm text-slate-500 mt-0.5">{produto.nome}</p>
        </div>
      </div>
      <FormularioProduto categorias={categorias ?? []} produto={produto} />
    </div>
  )
}

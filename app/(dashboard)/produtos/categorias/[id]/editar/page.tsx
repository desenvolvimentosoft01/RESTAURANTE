import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FormularioCategoria } from '@/components/produtos/FormularioCategoria'

export default async function EditarCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: categoria } = await supabase.from('categorias').select('*').eq('id', id).single()
  if (!categoria) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/produtos/categorias" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Editar Categoria</h1>
          <p className="text-sm text-slate-500 mt-0.5">{categoria.nome}</p>
        </div>
      </div>
      <FormularioCategoria categoria={categoria} />
    </div>
  )
}

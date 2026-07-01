import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FormularioCategoria } from '@/components/produtos/FormularioCategoria'

export default function NovaCategoriaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/produtos/categorias" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nova Categoria</h1>
          <p className="text-sm text-slate-500 mt-0.5">Cadastre uma categoria para organizar os produtos</p>
        </div>
      </div>
      <FormularioCategoria />
    </div>
  )
}

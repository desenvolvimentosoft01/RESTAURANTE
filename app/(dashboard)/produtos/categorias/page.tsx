import { createClient } from '@/lib/supabase/server'
import { TelaCategorias } from '@/components/erp/TelaCategorias'

export default async function CategoriasPage() {
  const supabase = await createClient()
  const { data: categorias } = await supabase.from('categorias').select('*').order('ordem')

  return (
    <div className="space-y-0 flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-800">Categorias</h1>
        <p className="text-xs text-slate-500 mt-0.5">Duplo clique na linha para editar</p>
      </div>
      <TelaCategorias categorias={categorias ?? []} />
    </div>
  )
}

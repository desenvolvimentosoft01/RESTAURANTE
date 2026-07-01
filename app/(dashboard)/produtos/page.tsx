import { createClient } from '@/lib/supabase/server'
import { TelaProdutos } from '@/components/erp/TelaProdutos'

export default async function ProdutosPage() {
  const supabase = await createClient()

  const [{ data: produtos }, { data: categorias }] = await Promise.all([
    supabase.from('produtos').select('*, categoria:categorias(id,nome)').order('nome'),
    supabase.from('categorias').select('*').eq('ativo', true).order('ordem'),
  ])

  return (
    <div className="space-y-0 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-800">Cadastro de Produtos</h1>
        <p className="text-xs text-slate-500 mt-0.5">Duplo clique na linha para editar • Selecione para habilitar ações na barra</p>
      </div>
      <div className="flex-1 min-h-0">
        <TelaProdutos produtos={produtos ?? []} categorias={categorias ?? []} />
      </div>
    </div>
  )
}

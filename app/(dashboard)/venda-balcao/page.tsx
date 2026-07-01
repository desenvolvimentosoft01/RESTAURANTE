import { createClient } from '@/lib/supabase/server'
import { PDVConteudo } from '@/components/pdv/PDVConteudo'

export default async function VendaBalcaoPage() {
  const supabase = await createClient()

  const [resCategorias, resProdutos] = await Promise.all([
    supabase.from('categorias').select('*').eq('ativo', true).order('ordem'),
    supabase.from('produtos').select('*, categoria:categorias(*)').eq('ativo', true).order('nome'),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Venda Balcão</h1>
      <PDVConteudo
        produtos={resProdutos.data ?? []}
        categorias={resCategorias.data ?? []}
      />
    </div>
  )
}

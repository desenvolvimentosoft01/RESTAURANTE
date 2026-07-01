import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeletarCategoriaBtn } from '@/components/produtos/DeletarCategoriaBtn'

export default async function CategoriasPage() {
  const supabase = await createClient()
  const { data: categorias } = await supabase
    .from('categorias')
    .select('*')
    .order('ordem')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categorias</h1>
          <p className="text-sm text-slate-500 mt-0.5">{categorias?.length ?? 0} categorias cadastradas</p>
        </div>
        <Button asChild>
          <Link href="/produtos/categorias/nova">
            <Plus size={16} className="mr-2" />
            Nova Categoria
          </Link>
        </Button>
      </div>

      {!categorias?.length ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <Tag size={48} className="text-slate-200" />
          <div>
            <p className="font-medium text-slate-600">Nenhuma categoria cadastrada</p>
            <p className="text-sm text-slate-400 mt-1">Crie categorias para organizar seus produtos</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-12">Ordem</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categorias.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-slate-400 text-center">{cat.ordem}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">{cat.nome}</p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Badge
                      variant={cat.ativo ? 'default' : 'secondary'}
                      className={cat.ativo ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                    >
                      {cat.ativo ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/produtos/categorias/${cat.id}/editar`}>
                          <Pencil size={14} />
                        </Link>
                      </Button>
                      <DeletarCategoriaBtn id={cat.id} nome={cat.nome} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

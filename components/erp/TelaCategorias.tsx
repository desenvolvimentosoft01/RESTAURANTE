'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Eraser, FileText, FilePlus, List, Pencil, Save, Search, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import { correspondeLike, correspondeTriState, type FiltroTriState } from '@/lib/busca'
import { createClient } from '@/lib/supabase/client'
import { registrarAuditoria } from '@/lib/auditoria'
import { BarraFerramentas } from '@/components/erp/BarraFerramentas'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { Categoria } from '@/types/database'

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  ordem: z.coerce.number().int().min(0),
  ativo: z.boolean(),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

const FORM_VAZIO: FormInput = { nome: '', ordem: 0, ativo: true }

export function TelaCategorias({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter()
  const [aba, setAba] = useState<'grade' | 'cadastro'>('grade')
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [linhaSelecionada, setLinhaSelecionada] = useState<string | null>(null)

  const [buscaTexto, setBuscaTexto] = useState('')
  const [buscaAtivo, setBuscaAtivo] = useState<FiltroTriState>('todos')

  const categoriasFiltradas = useMemo(() => {
    return categorias.filter((c) =>
      correspondeLike(c.nome, buscaTexto) && correspondeTriState(c.ativo, buscaAtivo)
    )
  }, [categorias, buscaTexto, buscaAtivo])

  function limparBusca() { setBuscaTexto(''); setBuscaAtivo('todos') }

  const { register, handleSubmit, reset, setValue, formState: { errors, isDirty } } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: FORM_VAZIO,
  })

  const carregar = useCallback((c: Categoria) => {
    setEditando(c)
    setLinhaSelecionada(c.id)
    reset({ nome: c.nome, ordem: c.ordem, ativo: c.ativo })
    setAba('cadastro')
  }, [reset])

  function novoRegistro() { setEditando(null); setLinhaSelecionada(null); reset(FORM_VAZIO); setAba('cadastro') }
  function limpar() { reset(FORM_VAZIO); setEditando(null); setLinhaSelecionada(null) }
  function cancelar() { limpar(); setAba('grade') }

  async function onSubmit(data: FormOutput) {
    setSalvando(true)
    const supabase = createClient()
    if (editando) {
      const { error } = await supabase.from('categorias').update(data).eq('id', editando.id)
      setSalvando(false)
      if (error) { toast.error('Erro ao salvar'); return }
      registrarAuditoria({
        tela: 'Categorias', acao: 'edicao', tabela: 'categorias', registroId: editando.id,
        antes: editando as unknown as Record<string, unknown>, depois: data as unknown as Record<string, unknown>,
      })
    } else {
      const { data: nova, error } = await supabase.from('categorias').insert(data).select().single()
      setSalvando(false)
      if (error) { toast.error('Erro ao salvar'); return }
      if (nova) registrarAuditoria({ tela: 'Categorias', acao: 'cadastro', tabela: 'categorias', registroId: nova.id, depois: data as unknown as Record<string, unknown> })
    }
    toast.success(editando ? 'Categoria atualizada!' : 'Categoria cadastrada!')
    cancelar()
    router.refresh()
  }

  async function excluir(id: string, nome: string) {
    if (!confirm(`Excluir a categoria "${nome}"?`)) return
    const supabase = createClient()

    const { count: produtosVinculados } = await supabase
      .from('produtos')
      .select('id', { count: 'exact', head: true })
      .eq('categoria_id', id)

    if ((produtosVinculados ?? 0) > 0) {
      const inativar = confirm(
        `A categoria "${nome}" possui produtos cadastrados. Excluí-la deixaria esses produtos sem categoria.\n\nDeseja inativar a categoria em vez de excluir?`
      )
      if (!inativar) return
      const { error } = await supabase.from('categorias').update({ ativo: false }).eq('id', id)
      if (error) { toast.error('Erro ao inativar'); return }
      registrarAuditoria({ tela: 'Categorias', acao: 'inativacao', tabela: 'categorias', registroId: id, antes: { ativo: true }, depois: { ativo: false } })
      toast.success('Categoria inativada')
      if (linhaSelecionada === id) cancelar()
      router.refresh()
      return
    }

    const { error } = await supabase.from('categorias').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir'); return }
    registrarAuditoria({ tela: 'Categorias', acao: 'exclusao', tabela: 'categorias', registroId: id, antes: { nome } })
    toast.success('Categoria excluída')
    if (linhaSelecionada === id) cancelar()
    router.refresh()
  }

  const botoesGrade = [
    { label: 'Novo', icon: FilePlus, onClick: novoRegistro, variante: 'primary' as const },
    { label: 'Editar', icon: Pencil, onClick: () => { const c = categorias.find(x => x.id === linhaSelecionada); if (c) carregar(c) }, disabled: !linhaSelecionada },
    { label: 'Excluir', icon: Trash2, onClick: () => { const c = categorias.find(x => x.id === linhaSelecionada); if (c) excluir(c.id, c.nome) }, disabled: !linhaSelecionada, variante: 'danger' as const },
  ]

  const botoesCadastro = [
    { label: 'Gravar', icon: Save, onClick: handleSubmit(onSubmit), variante: 'success' as const, disabled: salvando },
    { label: 'Limpar', icon: Eraser, onClick: limpar, variante: 'warning' as const },
    { label: 'Cancelar', icon: X, onClick: cancelar, variante: 'danger' as const },
  ]

  return (
    <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden flex flex-col">
      {/* Abas */}
      <div className="flex border-b border-slate-300 bg-slate-50">
        {(['grade', 'cadastro'] as const).map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium border-r border-slate-300 transition-all ${
              aba === a
                ? 'bg-white text-slate-800 border-b-2 border-b-amber-500 -mb-px'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            {a === 'grade' ? <><List size={14} /> Grade</> : <><FileText size={14} /> {editando ? `Editando: ${editando.nome}` : 'Cadastro'}{isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}</>}
          </button>
        ))}
      </div>

      <BarraFerramentas botoes={aba === 'grade' ? botoesGrade : botoesCadastro} />

      {aba === 'grade' && (
        <div className="overflow-auto flex-1">
          <div className="flex flex-wrap items-end gap-3 p-3 bg-slate-50 border-b border-slate-200">
            <div className="flex flex-col gap-1 min-w-[220px] flex-1">
              <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Nome</Label>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Ex: bebida"
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  className="h-8 pl-7 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Ativa</Label>
              <select
                value={buscaAtivo}
                onChange={(e) => setBuscaAtivo(e.target.value as FiltroTriState)}
                className="h-8 px-2 text-sm border border-slate-300 rounded-md bg-white text-slate-700"
              >
                <option value="todos">Todas</option>
                <option value="sim">Ativa</option>
                <option value="nao">Inativa</option>
              </select>
            </div>
            <button
              onClick={limparBusca}
              className="h-8 px-3 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
            >
              Limpar filtros
            </button>
            <span className="text-xs text-slate-500 ml-auto">
              <strong className="text-slate-700">{categoriasFiltradas.length}</strong> de {categorias.length} registro(s) encontrado(s)
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700 text-white text-[12px] uppercase tracking-wide">
                <th className="text-center px-4 py-2.5 font-semibold w-20">Ordem</th>
                <th className="text-left px-4 py-2.5 font-semibold">Nome</th>
                <th className="text-center px-4 py-2.5 font-semibold">Status</th>
                <th className="text-center px-4 py-2.5 font-semibold w-20">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categoriasFiltradas.map((c, i) => {
                const sel = linhaSelecionada === c.id
                return (
                  <tr
                    key={c.id}
                    onClick={() => setLinhaSelecionada(sel ? null : c.id)}
                    onDoubleClick={() => carregar(c)}
                    className={`cursor-pointer border-b border-slate-100 transition-colors ${sel ? 'bg-amber-50' : i % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100'}`}
                  >
                    <td className="px-4 py-2.5 text-center text-slate-500">{c.ordem}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{c.nome}</td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge className={c.ativo ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[11px]' : 'bg-slate-100 text-slate-500 text-[11px]'}>
                        {c.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); carregar(c) }} className="p-1 text-blue-500 hover:bg-blue-100 rounded"><Pencil size={13} /></button>
                        <button onClick={(e) => { e.stopPropagation(); excluir(c.id, c.nome) }} className="p-1 text-red-500 hover:bg-red-100 rounded"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {aba === 'cadastro' && (
        <div className="p-6 overflow-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
            <div className="grid grid-cols-3 gap-4 items-start">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">Nome da Categoria *</Label>
                <Input placeholder="Ex: Prato Principal" {...register('nome')} className="h-9" />
                {errors.nome && <p className="text-[11px] text-red-500">{errors.nome.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">Ordem</Label>
                <Input type="number" min="0" {...register('ordem')} className="h-9" />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 rounded-lg border border-slate-200 p-4">
              <Switch
                id="cat_ativo"
                key={`ativo-${editando?.id ?? 'novo'}`}
                defaultChecked={editando?.ativo ?? true}
                onCheckedChange={(v) => setValue('ativo', v)}
              />
              <Label htmlFor="cat_ativo" className="text-sm cursor-pointer">Categoria ativa</Label>
              <p className="text-[11px] text-slate-400 ml-auto">Categorias inativas não aparecem no cardápio</p>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800 text-[11px] text-slate-400">
        <span>{aba === 'grade' ? `${categoriasFiltradas.length} de ${categorias.length} registro(s)${linhaSelecionada ? ' • 1 selecionado' : ''}` : editando ? `Editando: ${editando.id.slice(0,8)}...` : 'Novo registro'}</span>
        <span>{salvando ? '💾 Salvando...' : 'Pronto'}</span>
      </div>
    </div>
  )
}

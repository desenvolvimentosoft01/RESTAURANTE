'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Eraser, FileText, FilePlus, List, Pencil, Save, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import { formatarMoeda } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { registrarAuditoria } from '@/lib/auditoria'
import { BarraFerramentas } from '@/components/erp/BarraFerramentas'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { Produto, Categoria, UnidadeMedida } from '@/types/database'

const UNIDADES: { valor: UnidadeMedida; label: string }[] = [
  { valor: 'UN', label: 'Unidade (UN)' },
  { valor: 'KG', label: 'Quilograma (KG)' },
  { valor: 'G', label: 'Grama (G)' },
  { valor: 'L', label: 'Litro (L)' },
  { valor: 'ML', label: 'Mililitro (ML)' },
  { valor: 'PC', label: 'Pacote (PC)' },
  { valor: 'CX', label: 'Caixa (CX)' },
  { valor: 'FT', label: 'Fardo (FT)' },
]

// Unidades fracionadas (peso/volume) aceitam estoque decimal; as demais são sempre inteiras.
const UNIDADES_FRACIONADAS: UnidadeMedida[] = ['KG', 'G', 'L', 'ML']

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  descricao: z.string().optional(),
  categoria_id: z.string().min(1, 'Categoria obrigatória'),
  preco: z.coerce.number().min(0.01, 'Preço obrigatório'),
  unidade_medida: z.enum(['UN', 'KG', 'G', 'L', 'ML', 'PC', 'CX', 'FT']),
  ativo: z.boolean(),
  disponivel_ifood: z.boolean(),
  controla_estoque: z.boolean(),
  estoque_atual: z.coerce.number().min(0),
  estoque_minimo: z.coerce.number().min(0),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

const FORM_VAZIO: FormInput = {
  nome: '', descricao: '', categoria_id: '',
  preco: '' as unknown as number,
  unidade_medida: 'UN',
  ativo: true, disponivel_ifood: false,
  controla_estoque: false, estoque_atual: 0, estoque_minimo: 0,
}

interface Props { produtos: Produto[]; categorias: Categoria[] }

type Aba = 'grade' | 'cadastro'

export function TelaProdutos({ produtos, categorias }: Props) {
  const router = useRouter()
  const [aba, setAba] = useState<Aba>('grade')
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [linhaSelecionada, setLinhaSelecionada] = useState<string | null>(null)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: FORM_VAZIO,
  })

  const controlaEstoque = watch('controla_estoque')
  const unidadeMedida = watch('unidade_medida')
  const passoEstoque = UNIDADES_FRACIONADAS.includes(unidadeMedida) ? '0.001' : '1'

  const carregarProduto = useCallback((p: Produto) => {
    setProdutoEditando(p)
    setLinhaSelecionada(p.id)
    reset({
      nome: p.nome,
      descricao: p.descricao ?? '',
      categoria_id: p.categoria_id,
      preco: p.preco,
      unidade_medida: p.unidade_medida,
      ativo: p.ativo,
      disponivel_ifood: p.disponivel_ifood,
      controla_estoque: p.controla_estoque,
      estoque_atual: p.estoque_atual,
      estoque_minimo: p.estoque_minimo,
    })
    setAba('cadastro')
  }, [reset])

  function novoRegistro() {
    setProdutoEditando(null)
    setLinhaSelecionada(null)
    reset(FORM_VAZIO)
    setAba('cadastro')
  }

  function limpar() {
    reset(FORM_VAZIO)
    setProdutoEditando(null)
    setLinhaSelecionada(null)
  }

  function cancelar() {
    limpar()
    setAba('grade')
  }

  async function onSubmit(data: FormOutput) {
    setSalvando(true)
    const supabase = createClient()
    let erro = null
    if (produtoEditando) {
      const { error } = await supabase.from('produtos').update(data).eq('id', produtoEditando.id)
      erro = error
      if (!error) {
        registrarAuditoria({
          tela: 'Produtos', acao: 'edicao', tabela: 'produtos', registroId: produtoEditando.id,
          antes: produtoEditando as unknown as Record<string, unknown>,
          depois: data as unknown as Record<string, unknown>,
        })
      }
    } else {
      const { data: novo, error } = await supabase.from('produtos').insert(data).select().single()
      erro = error
      if (!error && novo) {
        registrarAuditoria({
          tela: 'Produtos', acao: 'cadastro', tabela: 'produtos', registroId: novo.id,
          depois: data as unknown as Record<string, unknown>,
        })
      }
    }
    setSalvando(false)
    if (erro) { toast.error('Erro ao salvar produto'); return }
    toast.success(produtoEditando ? 'Produto atualizado!' : 'Produto cadastrado!')
    limpar()
    setAba('grade')
    router.refresh()
  }

  async function excluir(id: string, nome: string) {
    if (!confirm(`Excluir o produto "${nome}"?`)) return
    const supabase = createClient()

    // Produto com histórico de venda/movimentação não pode ser excluído
    // (apagaria o histórico); nesse caso oferece inativar do mix.
    const [{ count: emPedidos }, { count: emMovimentacoes }] = await Promise.all([
      supabase.from('itens_pedido').select('id', { count: 'exact', head: true }).eq('produto_id', id),
      supabase.from('movimentacoes_estoque_produto').select('id', { count: 'exact', head: true }).eq('produto_id', id),
    ])

    if ((emPedidos ?? 0) > 0 || (emMovimentacoes ?? 0) > 0) {
      const inativar = confirm(
        `O produto "${nome}" já teve movimentação de estoque ou venda e não pode ser excluído, pois isso apagaria o histórico.\n\nDeseja inativá-lo do mix da loja em vez disso?`
      )
      if (!inativar) return
      const { error } = await supabase.from('produtos').update({ ativo: false }).eq('id', id)
      if (error) { toast.error('Erro ao inativar'); return }
      registrarAuditoria({ tela: 'Produtos', acao: 'inativacao', tabela: 'produtos', registroId: id, antes: { ativo: true }, depois: { ativo: false } })
      toast.success('Produto inativado do mix')
      if (linhaSelecionada === id) cancelar()
      router.refresh()
      return
    }

    const { error } = await supabase.from('produtos').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir'); return }
    registrarAuditoria({ tela: 'Produtos', acao: 'exclusao', tabela: 'produtos', registroId: id, antes: { nome } })
    toast.success('Produto excluído')
    if (linhaSelecionada === id) cancelar()
    router.refresh()
  }

  const botoesGrade = [
    { label: 'Novo', icon: FilePlus, onClick: novoRegistro, variante: 'primary' as const },
    { label: 'Editar', icon: Pencil, onClick: () => { if (linhaSelecionada) { const p = produtos.find(x => x.id === linhaSelecionada); if (p) carregarProduto(p) } }, disabled: !linhaSelecionada, variante: 'default' as const },
    { label: 'Excluir', icon: Trash2, onClick: () => { if (linhaSelecionada) { const p = produtos.find(x => x.id === linhaSelecionada); if (p) excluir(p.id, p.nome) } }, disabled: !linhaSelecionada, variante: 'danger' as const },
  ]

  const botoesCadastro = [
    { label: 'Gravar', icon: Save, onClick: handleSubmit(onSubmit), variante: 'success' as const, disabled: salvando },
    { label: 'Limpar', icon: Eraser, onClick: limpar, variante: 'warning' as const },
    { label: 'Cancelar', icon: X, onClick: cancelar, variante: 'danger' as const },
  ]

  return (
    <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden flex flex-col">
      {/* Padrão TDI (Tela De Informação): Grade + Cadastro na mesma tela.
          Evita navegação de páginas e mantém o contexto do registro selecionado. */}
      <div className="flex border-b border-slate-300 bg-slate-50">
        <button
          onClick={() => setAba('grade')}
          className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium border-r border-slate-300 transition-all ${
            aba === 'grade'
              ? 'bg-white text-slate-800 border-b-2 border-b-amber-500 -mb-px'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <List size={14} />
          Grade de Produtos
        </button>
        <button
          onClick={() => setAba('cadastro')}
          className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium transition-all ${
            aba === 'cadastro'
              ? 'bg-white text-slate-800 border-b-2 border-b-amber-500 -mb-px border-r border-slate-300'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border-r border-slate-300'
          }`}
        >
          <FileText size={14} />
          {produtoEditando ? `Editando: ${produtoEditando.nome}` : 'Cadastro'}
          {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
        </button>
      </div>

      {/* Barra de Ferramentas */}
      <BarraFerramentas botoes={aba === 'grade' ? botoesGrade : botoesCadastro} />

      {/* Conteúdo */}
      {aba === 'grade' && (
        <div className="overflow-auto flex-1">
          {!produtos.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <List size={40} strokeWidth={1} />
              <p className="text-sm">Nenhum produto cadastrado. Clique em "Novo" para começar.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-700 text-white text-[12px] uppercase tracking-wide">
                  <th className="text-left px-4 py-2.5 font-semibold">Nome</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Categoria</th>
                  <th className="text-right px-4 py-2.5 font-semibold">Preço</th>
                  <th className="text-center px-4 py-2.5 font-semibold">Estoque</th>
                  <th className="text-center px-4 py-2.5 font-semibold">Status</th>
                  <th className="text-center px-4 py-2.5 font-semibold w-20">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p, i) => {
                  const selecionado = linhaSelecionada === p.id
                  const alerta = p.controla_estoque && p.estoque_atual <= p.estoque_minimo
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setLinhaSelecionada(selecionado ? null : p.id)}
                      onDoubleClick={() => carregarProduto(p)}
                      className={`cursor-pointer border-b border-slate-100 transition-colors ${
                        selecionado
                          ? 'bg-amber-50 border-amber-200'
                          : i % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100'
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <p className={`font-medium ${selecionado ? 'text-amber-800' : 'text-slate-800'}`}>{p.nome}</p>
                        {p.descricao && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{p.descricao}</p>}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-[12px]">
                        {(p.categoria as { nome: string } | null)?.nome ?? '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-800">{formatarMoeda(p.preco)}</td>
                      <td className="px-4 py-2.5 text-center">
                        {p.controla_estoque
                          ? <span className={`font-bold ${alerta ? 'text-red-600' : 'text-slate-700'}`}>{p.estoque_atual} {p.unidade_medida}{alerta && ' ⚠'}</span>
                          : <span className="text-slate-300 text-[11px]">—</span>
                        }
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <Badge className={p.ativo ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[11px]' : 'bg-slate-100 text-slate-500 text-[11px]'}>
                          {p.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); carregarProduto(p) }}
                            className="p-1 text-blue-500 hover:bg-blue-100 rounded transition-colors"
                            title="Editar"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); excluir(p.id, p.nome) }}
                            className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {aba === 'cadastro' && (
        <div className="p-6 overflow-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-3xl">
            {/* Linha 1 */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-6 space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">Nome do Produto *</Label>
                <Input placeholder="Ex: Parmegiana de Frango" {...register('nome')} className="h-9" />
                {errors.nome && <p className="text-[11px] text-red-500">{errors.nome.message}</p>}
              </div>
              <div className="col-span-3 space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">Categoria *</Label>
                <Select
                  defaultValue={produtoEditando?.categoria_id}
                  key={produtoEditando?.id ?? 'novo'}
                  onValueChange={(v) => setValue('categoria_id', v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.categoria_id && <p className="text-[11px] text-red-500">{errors.categoria_id.message}</p>}
              </div>
              <div className="col-span-3 space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">Preço (R$) *</Label>
                <Input type="number" step="0.01" placeholder="0,00" {...register('preco')} className="h-9" />
                {errors.preco && <p className="text-[11px] text-red-500">{errors.preco.message}</p>}
              </div>
            </div>

            {/* Linha 1b — Unidade de medida */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-4 space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">Unidade de Medida *</Label>
                <Select
                  defaultValue={produtoEditando?.unidade_medida ?? 'UN'}
                  key={`un-${produtoEditando?.id ?? 'novo'}`}
                  onValueChange={(v) => setValue('unidade_medida', v as UnidadeMedida)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES.map((u) => <SelectItem key={u.valor} value={u.valor}>{u.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-400">Ex: KG permite vender/estocar em peso fracionado (0,750 kg).</p>
              </div>
            </div>

            {/* Linha 2 */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">Descrição</Label>
              <Textarea placeholder="Descrição opcional" rows={2} {...register('descricao')} className="resize-none" />
            </div>

            {/* Switch usa defaultChecked (não controlled) porque o react-hook-form
                gerencia o valor via setValue/onCheckedChange. A prop key força
                remount ao trocar de registro, garantindo que o estado visual do
                Switch reflita o produto carregado — sem key o DOM reutiliza o
                elemento e o toggle fica no estado do produto anterior. */}
            <div className="flex items-center gap-8 bg-slate-50 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2.5">
                <Switch
                  id="ativo"
                  key={`ativo-${produtoEditando?.id ?? 'novo'}`}
                  defaultChecked={produtoEditando?.ativo ?? true}
                  onCheckedChange={(v) => setValue('ativo', v)}
                />
                <Label htmlFor="ativo" className="text-sm cursor-pointer">Produto ativo</Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Switch
                  id="disponivel_ifood"
                  key={`ifood-${produtoEditando?.id ?? 'novo'}`}
                  defaultChecked={produtoEditando?.disponivel_ifood ?? false}
                  onCheckedChange={(v) => setValue('disponivel_ifood', v)}
                />
                <Label htmlFor="disponivel_ifood" className="text-sm cursor-pointer">Disponível no iFood</Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Switch
                  id="controla_estoque"
                  key={`estoque-${produtoEditando?.id ?? 'novo'}`}
                  defaultChecked={produtoEditando?.controla_estoque ?? false}
                  onCheckedChange={(v) => setValue('controla_estoque', v)}
                />
                <Label htmlFor="controla_estoque" className="text-sm cursor-pointer">Controlar estoque</Label>
              </div>
            </div>

            {/* Linha 4 — Estoque (condicional) */}
            {controlaEstoque && (
              <div className="grid grid-cols-3 gap-4 bg-amber-50 rounded-lg border border-amber-200 p-4">
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">Estoque Atual ({unidadeMedida})</Label>
                  <Input type="number" min="0" step={passoEstoque} {...register('estoque_atual')} className="h-9 bg-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">Estoque Mínimo ({unidadeMedida})</Label>
                  <Input type="number" min="0" step={passoEstoque} {...register('estoque_minimo')} className="h-9 bg-white" />
                </div>
                <div className="flex items-end pb-0.5">
                  <p className="text-[11px] text-amber-700">
                    Alerta quando o estoque atingir o mínimo definido.
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800 text-[11px] text-slate-400">
        <span>
          {aba === 'grade'
            ? `${produtos.length} registro(s) ${linhaSelecionada ? '• 1 selecionado' : ''}`
            : produtoEditando ? `Editando: ${produtoEditando.id.slice(0, 8)}...` : 'Novo registro'
          }
        </span>
        <span>{salvando ? '💾 Salvando...' : 'Pronto'}</span>
      </div>
    </div>
  )
}

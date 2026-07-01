'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Categoria, Produto } from '@/types/database'

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  descricao: z.string().optional(),
  categoria_id: z.string().min(1, 'Categoria obrigatória'),
  preco: z.coerce.number().min(0.01, 'Preço obrigatório'),
  ativo: z.boolean(),
  disponivel_ifood: z.boolean(),
  controla_estoque: z.boolean(),
  estoque_atual: z.coerce.number().int().min(0),
  estoque_minimo: z.coerce.number().int().min(0),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

interface Props {
  categorias: Categoria[]
  produto?: Produto
}

export function FormularioProduto({ categorias, produto }: Props) {
  const router = useRouter()
  const editando = !!produto

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: produto?.nome ?? '',
      descricao: produto?.descricao ?? '',
      categoria_id: produto?.categoria_id ?? '',
      preco: produto?.preco ?? ('' as unknown as number),
      ativo: produto?.ativo ?? true,
      disponivel_ifood: produto?.disponivel_ifood ?? false,
      controla_estoque: produto?.controla_estoque ?? false,
      estoque_atual: produto?.estoque_atual ?? 0,
      estoque_minimo: produto?.estoque_minimo ?? 0,
    },
  })

  const controlaEstoque = watch('controla_estoque')

  async function onSubmit(data: FormOutput) {
    const supabase = createClient()

    if (editando) {
      const { error } = await supabase.from('produtos').update(data).eq('id', produto.id)
      if (error) { toast.error('Erro ao salvar'); return }
      toast.success('Produto atualizado!')
    } else {
      const { error } = await supabase.from('produtos').insert(data)
      if (error) { toast.error('Erro ao cadastrar'); return }
      toast.success('Produto cadastrado!')
    }

    router.push('/produtos')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-800 text-base border-b border-slate-100 pb-3">Informações básicas</h2>

        <div className="space-y-2">
          <Label htmlFor="nome">Nome do produto *</Label>
          <Input id="nome" placeholder="Ex: Parmegiana de Frango" {...register('nome')} />
          {errors.nome && <p className="text-xs text-red-500">{errors.nome.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea id="descricao" placeholder="Descrição opcional do produto" rows={3} {...register('descricao')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="categoria_id">Categoria *</Label>
            <Select
              defaultValue={produto?.categoria_id}
              onValueChange={(v) => setValue('categoria_id', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoria_id && <p className="text-xs text-red-500">{errors.categoria_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="preco">Preço (R$) *</Label>
            <Input id="preco" type="number" step="0.01" placeholder="0,00" {...register('preco')} />
            {errors.preco && <p className="text-xs text-red-500">{errors.preco.message}</p>}
          </div>
        </div>

        <div className="flex items-center gap-8 pt-2">
          <div className="flex items-center gap-3">
            <Switch
              id="ativo"
              defaultChecked={produto?.ativo ?? true}
              onCheckedChange={(v) => setValue('ativo', v)}
            />
            <Label htmlFor="ativo">Produto ativo</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="disponivel_ifood"
              defaultChecked={produto?.disponivel_ifood ?? false}
              onCheckedChange={(v) => setValue('disponivel_ifood', v)}
            />
            <Label htmlFor="disponivel_ifood">Disponível no iFood</Label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-semibold text-slate-800 text-base">Controle de Estoque</h2>
          <div className="flex items-center gap-3">
            <Switch
              id="controla_estoque"
              defaultChecked={produto?.controla_estoque ?? false}
              onCheckedChange={(v) => setValue('controla_estoque', v)}
            />
            <Label htmlFor="controla_estoque" className="text-sm">Controlar estoque deste produto</Label>
          </div>
        </div>

        {controlaEstoque && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estoque_atual">Estoque atual (unidades)</Label>
              <Input id="estoque_atual" type="number" min="0" {...register('estoque_atual')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estoque_minimo">Estoque mínimo (alerta)</Label>
              <Input id="estoque_minimo" type="number" min="0" {...register('estoque_minimo')} />
            </div>
          </div>
        )}

        {!controlaEstoque && (
          <p className="text-sm text-slate-400 italic">
            Ative o controle de estoque para definir quantidades e receber alertas de estoque baixo.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar produto'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/produtos')}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

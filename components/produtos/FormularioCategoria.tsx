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
import { Switch } from '@/components/ui/switch'
import type { Categoria } from '@/types/database'

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  ordem: z.coerce.number().int().min(0),
  ativo: z.boolean(),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export function FormularioCategoria({ categoria }: { categoria?: Categoria }) {
  const router = useRouter()
  const editando = !!categoria

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: categoria?.nome ?? '',
      ordem: categoria?.ordem ?? 0,
      ativo: categoria?.ativo ?? true,
    },
  })

  async function onSubmit(data: FormOutput) {
    const supabase = createClient()

    if (editando) {
      const { error } = await supabase.from('categorias').update(data).eq('id', categoria.id)
      if (error) { toast.error('Erro ao salvar'); return }
      toast.success('Categoria atualizada!')
    } else {
      const { error } = await supabase.from('categorias').insert(data)
      if (error) { toast.error('Erro ao cadastrar'); return }
      toast.success('Categoria cadastrada!')
    }

    router.push('/produtos/categorias')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome da categoria *</Label>
          <Input id="nome" placeholder="Ex: Prato Principal" {...register('nome')} />
          {errors.nome && <p className="text-xs text-red-500">{errors.nome.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ordem">Ordem de exibição</Label>
          <Input id="ordem" type="number" min="0" {...register('ordem')} />
          <p className="text-xs text-slate-400">Número menor aparece primeiro no cardápio</p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Switch
            id="ativo"
            defaultChecked={categoria?.ativo ?? true}
            onCheckedChange={(v) => setValue('ativo', v)}
          />
          <Label htmlFor="ativo">Categoria ativa</Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar categoria'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/produtos/categorias')}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

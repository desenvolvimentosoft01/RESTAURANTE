'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Conta } from '@/types/database'

const schema = z.object({
  tipo: z.enum(['pagar', 'receber']),
  descricao: z.string().min(1, 'Descrição obrigatória'),
  valor: z.coerce.number().min(0.01, 'Valor obrigatório'),
  vencimento: z.string().min(1, 'Vencimento obrigatório'),
  categoria: z.string().optional(),
  observacao: z.string().optional(),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

const CATEGORIAS = [
  'aluguel', 'energia', 'agua', 'gas', 'salario',
  'fornecedor', 'manutencao', 'imposto', 'outros',
]

export function FormularioConta({ conta }: { conta?: Conta }) {
  const router = useRouter()
  const editando = !!conta

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: conta?.tipo ?? 'pagar',
      descricao: conta?.descricao ?? '',
      valor: conta?.valor ?? ('' as unknown as number),
      vencimento: conta?.vencimento ?? '',
      categoria: conta?.categoria ?? '',
      observacao: conta?.observacao ?? '',
    },
  })

  async function onSubmit(data: FormOutput) {
    const supabase = createClient()
    if (editando) {
      const { error } = await supabase.from('contas').update(data).eq('id', conta.id)
      if (error) { toast.error('Erro ao salvar'); return }
      toast.success('Conta atualizada!')
    } else {
      const { error } = await supabase.from('contas').insert(data)
      if (error) { toast.error('Erro ao cadastrar'); return }
      toast.success('Conta cadastrada!')
    }
    router.push('/financeiro/contas')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="space-y-2">
          <Label>Tipo *</Label>
          <Select defaultValue={conta?.tipo ?? 'pagar'} onValueChange={(v) => setValue('tipo', v as 'pagar' | 'receber')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pagar">A Pagar</SelectItem>
              <SelectItem value="receber">A Receber</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição *</Label>
          <Input id="descricao" placeholder="Ex: Aluguel do espaço" {...register('descricao')} />
          {errors.descricao && <p className="text-xs text-red-500">{errors.descricao.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$) *</Label>
            <Input id="valor" type="number" step="0.01" placeholder="0,00" {...register('valor')} />
            {errors.valor && <p className="text-xs text-red-500">{errors.valor.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="vencimento">Vencimento *</Label>
            <Input id="vencimento" type="date" {...register('vencimento')} />
            {errors.vencimento && <p className="text-xs text-red-500">{errors.vencimento.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select defaultValue={conta?.categoria ?? ''} onValueChange={(v) => setValue('categoria', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacao">Observação</Label>
          <Textarea id="observacao" rows={2} {...register('observacao')} />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar conta'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/financeiro/contas')}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

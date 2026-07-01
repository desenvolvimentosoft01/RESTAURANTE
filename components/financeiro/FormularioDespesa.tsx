'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { CategoriaFinanceira } from '@/types/database'

const CATEGORIAS: { valor: CategoriaFinanceira; label: string }[] = [
  { valor: 'compra_insumo', label: 'Compra de insumo' },
  { valor: 'salario', label: 'Salário' },
  { valor: 'aluguel', label: 'Aluguel' },
  { valor: 'energia', label: 'Energia' },
  { valor: 'agua', label: 'Água' },
  { valor: 'gas', label: 'Gás' },
  { valor: 'manutencao', label: 'Manutenção' },
  { valor: 'outros', label: 'Outros' },
]

const schema = z.object({
  descricao: z.string().min(1, 'Informe a descrição'),
  categoria: z.string().min(1, 'Selecione uma categoria'),
  valor: z.coerce.number().positive('Informe um valor válido'),
  data_competencia: z.string().min(1, 'Informe a data'),
})

type FormDespesa = z.input<typeof schema>

interface Props {
  onSalvo: () => void
}

export function FormularioDespesa({ onSalvo }: Props) {
  const [aberto, setAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormDespesa>({
    resolver: zodResolver(schema),
    defaultValues: {
      data_competencia: new Date().toISOString().split('T')[0],
    },
  })

  async function onSubmit(dados: FormDespesa) {
    setSalvando(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('transacoes').insert({
        tipo: 'saida',
        categoria: dados.categoria as CategoriaFinanceira,
        descricao: dados.descricao,
        valor: Number(dados.valor),
        data_competencia: dados.data_competencia,
      })
      if (error) throw error
      toast.success('Despesa registrada')
      reset({ data_competencia: new Date().toISOString().split('T')[0] })
      setAberto(false)
      onSalvo()
    } catch {
      toast.error('Erro ao registrar despesa')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline">+ Lançar despesa</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova despesa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" placeholder="Ex: Pagamento fornecedor" {...register('descricao')} />
            {errors.descricao && <p className="text-sm text-red-600">{errors.descricao.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Controller
              name="categoria"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((c) => (
                      <SelectItem key={c.valor} value={c.valor}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoria && <p className="text-sm text-red-600">{errors.categoria.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input id="valor" type="number" step="0.01" min="0.01" {...register('valor')} />
              {errors.valor && <p className="text-sm text-red-600">{errors.valor.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_competencia">Data</Label>
              <Input id="data_competencia" type="date" {...register('data_competencia')} />
              {errors.data_competencia && <p className="text-sm text-red-600">{errors.data_competencia.message}</p>}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Registrar despesa'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

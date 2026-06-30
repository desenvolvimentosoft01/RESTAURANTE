'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Ingrediente } from '@/types/database'

const schema = z.object({
  nome: z.string().min(1, 'Informe o nome'),
  unidade: z.string().min(1, 'Informe a unidade (ex: kg, L, un)'),
  quantidade_atual: z.coerce.number().min(0, 'Quantidade inválida'),
  quantidade_minima: z.coerce.number().min(0, 'Quantidade inválida'),
  preco_custo: z.coerce.number().min(0, 'Preço inválido'),
})

type FormIngrediente = z.input<typeof schema>

interface Props {
  ingrediente?: Ingrediente
  onSalvo: () => void
}

export function FormularioIngrediente({ ingrediente, onSalvo }: Props) {
  const [aberto, setAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormIngrediente>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: ingrediente?.nome ?? '',
      unidade: ingrediente?.unidade ?? '',
      quantidade_atual: ingrediente?.quantidade_atual ?? 0,
      quantidade_minima: ingrediente?.quantidade_minima ?? 0,
      preco_custo: ingrediente?.preco_custo ?? 0,
    },
  })

  async function onSubmit(dados: FormIngrediente) {
    setSalvando(true)
    try {
      const supabase = createClient()
      const payload = {
        nome: dados.nome,
        unidade: dados.unidade,
        quantidade_atual: Number(dados.quantidade_atual),
        quantidade_minima: Number(dados.quantidade_minima),
        preco_custo: Number(dados.preco_custo),
      }

      if (ingrediente) {
        const { error } = await supabase.from('ingredientes').update(payload).eq('id', ingrediente.id)
        if (error) throw error
        toast.success('Ingrediente atualizado')
      } else {
        const { error } = await supabase.from('ingredientes').insert(payload)
        if (error) throw error
        toast.success('Ingrediente cadastrado')
      }

      reset()
      setAberto(false)
      onSalvo()
    } catch {
      toast.error('Erro ao salvar ingrediente')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant={ingrediente ? 'ghost' : 'default'} size={ingrediente ? 'sm' : 'default'}>
          {ingrediente ? 'Editar' : '+ Novo ingrediente'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ingrediente ? 'Editar ingrediente' : 'Novo ingrediente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" placeholder="Ex: Farinha de trigo" {...register('nome')} />
            {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidade">Unidade de medida</Label>
            <Input id="unidade" placeholder="Ex: kg, L, un, g" {...register('unidade')} />
            {errors.unidade && <p className="text-sm text-red-600">{errors.unidade.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade_atual">Quantidade atual</Label>
              <Input id="quantidade_atual" type="number" step="0.01" min="0" {...register('quantidade_atual')} />
              {errors.quantidade_atual && <p className="text-sm text-red-600">{errors.quantidade_atual.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidade_minima">Quantidade mínima</Label>
              <Input id="quantidade_minima" type="number" step="0.01" min="0" {...register('quantidade_minima')} />
              {errors.quantidade_minima && <p className="text-sm text-red-600">{errors.quantidade_minima.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preco_custo">Preço de custo (R$)</Label>
            <Input id="preco_custo" type="number" step="0.01" min="0" {...register('preco_custo')} />
            {errors.preco_custo && <p className="text-sm text-red-600">{errors.preco_custo.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

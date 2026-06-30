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
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Ingrediente } from '@/types/database'

const schema = z.object({
  quantidade: z.coerce.number().positive('Informe uma quantidade válida'),
  motivo: z.string().min(1, 'Informe o motivo (ex: Compra)'),
})

type FormEntrada = z.input<typeof schema>

interface Props {
  ingrediente: Ingrediente
  onSalvo: () => void
}

export function FormularioEntrada({ ingrediente, onSalvo }: Props) {
  const [aberto, setAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormEntrada>({
    resolver: zodResolver(schema),
    defaultValues: { quantidade: 0, motivo: 'Compra' },
  })

  async function onSubmit(dados: FormEntrada) {
    setSalvando(true)
    try {
      const supabase = createClient()

      const novaQuantidade = ingrediente.quantidade_atual + Number(dados.quantidade)

      const [{ error: errMovimentacao }, { error: errIngrediente }] = await Promise.all([
        supabase.from('movimentacoes_estoque').insert({
          ingrediente_id: ingrediente.id,
          tipo: 'entrada',
          quantidade: Number(dados.quantidade),
          motivo: dados.motivo,
        }),
        supabase
          .from('ingredientes')
          .update({ quantidade_atual: novaQuantidade })
          .eq('id', ingrediente.id),
      ])

      if (errMovimentacao) throw errMovimentacao
      if (errIngrediente) throw errIngrediente

      toast.success(`Entrada de ${dados.quantidade} ${ingrediente.unidade} registrada`)
      reset()
      setAberto(false)
      onSalvo()
    } catch {
      toast.error('Erro ao registrar entrada')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          + Entrada
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Entrada de estoque — {ingrediente.nome}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantidade">
              Quantidade ({ingrediente.unidade})
            </Label>
            <Input
              id="quantidade"
              type="number"
              step="0.01"
              min="0.01"
              {...register('quantidade')}
            />
            {errors.quantidade && (
              <p className="text-sm text-red-600">{errors.quantidade.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo</Label>
            <Textarea id="motivo" placeholder="Ex: Compra do fornecedor X" {...register('motivo')} />
            {errors.motivo && (
              <p className="text-sm text-red-600">{errors.motivo.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={salvando}>
            {salvando ? 'Registrando...' : 'Registrar entrada'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

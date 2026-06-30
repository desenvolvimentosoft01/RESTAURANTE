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
import type { Categoria } from '@/types/database'

const schemaCategoria = z.object({
  nome: z.string().min(1, 'Informe o nome da categoria'),
})

type FormCategoria = z.infer<typeof schemaCategoria>

interface FormularioCategoriaProps {
  categoria?: Categoria
  onSalvo: () => void
}

export function FormularioCategoria({ categoria, onSalvo }: FormularioCategoriaProps) {
  const [aberto, setAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormCategoria>({
    resolver: zodResolver(schemaCategoria),
    defaultValues: { nome: categoria?.nome ?? '' },
  })

  async function onSubmit(dados: FormCategoria) {
    setSalvando(true)
    try {
      const supabase = createClient()

      if (categoria) {
        const { error } = await supabase
          .from('categorias')
          .update({ nome: dados.nome })
          .eq('id', categoria.id)
        if (error) throw error
        toast.success('Categoria atualizada com sucesso')
      } else {
        const { error } = await supabase
          .from('categorias')
          .insert({ nome: dados.nome, ativo: true, ordem: 0 })
        if (error) throw error
        toast.success('Categoria criada com sucesso')
      }

      reset()
      setAberto(false)
      onSalvo()
    } catch {
      toast.error('Erro ao salvar categoria')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant={categoria ? 'ghost' : 'default'} size={categoria ? 'sm' : 'default'}>
          {categoria ? 'Editar' : '+ Nova categoria'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{categoria ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" placeholder="Ex: Bebidas" {...register('nome')} />
            {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

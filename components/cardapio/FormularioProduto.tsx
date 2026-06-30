'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Categoria, Produto } from '@/types/database'

const schemaProduto = z.object({
  nome: z.string().min(1, 'Informe o nome do produto'),
  categoria_id: z.string().min(1, 'Selecione uma categoria'),
  descricao: z.string().optional(),
  preco: z.coerce.number().positive('Informe um preço válido'),
  ativo: z.boolean(),
  disponivel_ifood: z.boolean(),
})

type FormProdutoEntrada = z.input<typeof schemaProduto>
type FormProduto = z.output<typeof schemaProduto>

interface FormularioProdutoProps {
  produto?: Produto
  categorias: Categoria[]
  onSalvo: () => void
}

export function FormularioProduto({ produto, categorias, onSalvo }: FormularioProdutoProps) {
  const [aberto, setAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormProdutoEntrada, unknown, FormProduto>({
    resolver: zodResolver(schemaProduto),
    defaultValues: {
      nome: produto?.nome ?? '',
      categoria_id: produto?.categoria_id ?? '',
      descricao: produto?.descricao ?? '',
      preco: produto?.preco ?? 0,
      ativo: produto?.ativo ?? true,
      disponivel_ifood: produto?.disponivel_ifood ?? false,
    },
  })

  async function onSubmit(dados: FormProduto) {
    setSalvando(true)
    try {
      const supabase = createClient()
      const payload = {
        nome: dados.nome,
        categoria_id: dados.categoria_id,
        descricao: dados.descricao || null,
        preco: dados.preco,
        ativo: dados.ativo,
        disponivel_ifood: dados.disponivel_ifood,
      }

      if (produto) {
        const { error } = await supabase.from('produtos').update(payload).eq('id', produto.id)
        if (error) throw error
        toast.success('Produto atualizado com sucesso')
      } else {
        const { error } = await supabase.from('produtos').insert(payload)
        if (error) throw error
        toast.success('Produto criado com sucesso')
      }

      reset()
      setAberto(false)
      onSalvo()
    } catch {
      toast.error('Erro ao salvar produto')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant={produto ? 'ghost' : 'default'} size={produto ? 'sm' : 'default'}>
          {produto ? 'Editar' : '+ Novo produto'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{produto ? 'Editar produto' : 'Novo produto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" placeholder="Ex: X-Burguer" {...register('nome')} />
            {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria_id">Categoria</Label>
            <Controller
              name="categoria_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="categoria_id" className="w-full">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoria_id && (
              <p className="text-sm text-red-600">{errors.categoria_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" placeholder="Opcional" {...register('descricao')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preco">Preço (R$)</Label>
            <Input id="preco" type="number" step="0.01" min="0" {...register('preco')} />
            {errors.preco && <p className="text-sm text-red-600">{errors.preco.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="ativo">Ativo no cardápio</Label>
            <Controller
              name="ativo"
              control={control}
              render={({ field }) => (
                <Switch id="ativo" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="disponivel_ifood">Disponível no iFood</Label>
            <Controller
              name="disponivel_ifood"
              control={control}
              render={({ field }) => (
                <Switch
                  id="disponivel_ifood"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

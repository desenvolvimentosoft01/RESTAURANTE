'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const schemaLogin = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  senha: z.string().min(1, 'Informe a senha'),
})

type FormLogin = z.infer<typeof schemaLogin>

export function FormularioLogin() {
  const router = useRouter()
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormLogin>({
    resolver: zodResolver(schemaLogin),
  })

  async function onSubmit(dados: FormLogin) {
    setErro(null)
    setCarregando(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: dados.email,
        password: dados.senha,
      })

      if (error) {
        setErro('E-mail ou senha incorretos.')
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setErro('Não foi possível conectar. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">🍽️ Restaurante</CardTitle>
        <CardDescription>Entre com seu e-mail e senha para acessar o sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="senha" className="text-sm font-medium text-slate-700">
              Senha
            </label>
            <Input
              id="senha"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('senha')}
            />
            {errors.senha && (
              <p className="text-sm text-red-600">{errors.senha.message}</p>
            )}
          </div>

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {erro}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

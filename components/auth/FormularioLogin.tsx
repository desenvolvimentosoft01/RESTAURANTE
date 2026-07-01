'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Lock, LogIn, Mail } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  } = useForm<FormLogin>({ resolver: zodResolver(schemaLogin) })

  async function onSubmit(dados: FormLogin) {
    setErro(null)
    setCarregando(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: dados.email,
        password: dados.senha,
      })
      if (error) { setErro('E-mail ou senha incorretos.'); return }
      router.push('/')
      router.refresh()
    } catch {
      setErro('Não foi possível conectar. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🍽️</div>
        <h1 className="text-2xl font-bold text-slate-900">Bem-vindo</h1>
        <p className="text-slate-500 text-sm mt-1">Acesse o sistema de gestão do restaurante</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              className="pl-9"
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              id="senha"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="pl-9"
              {...register('senha')}
            />
          </div>
          {errors.senha && <p className="text-sm text-red-600">{errors.senha.message}</p>}
        </div>

        {erro && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {erro}
          </div>
        )}

        <Button type="submit" className="w-full gap-2" disabled={carregando}>
          {carregando ? 'Entrando...' : (<><LogIn size={16} /> Entrar</>)}
        </Button>
      </form>
    </div>
  )
}

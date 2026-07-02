import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AcaoAuditoria } from '@/types/database'

interface PayloadAuditoria {
  tela: string
  acao: AcaoAuditoria
  tabela: string
  registro_id?: string | null
  dados_antes?: Record<string, unknown> | null
  dados_depois?: Record<string, unknown> | null
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as PayloadAuditoria
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      null

    const { error } = await supabase.from('auditoria').insert({
      usuario_id: user?.id ?? null,
      usuario_email: user?.email ?? null,
      tela: payload.tela,
      acao: payload.acao,
      tabela: payload.tabela,
      registro_id: payload.registro_id ?? null,
      dados_antes: payload.dados_antes ?? null,
      dados_depois: payload.dados_depois ?? null,
      ip,
      user_agent: request.headers.get('user-agent'),
    })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error)
    return NextResponse.json({ error: 'Erro ao registrar auditoria' }, { status: 500 })
  }
}

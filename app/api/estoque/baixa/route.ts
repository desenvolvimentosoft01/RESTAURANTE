import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { pedido_id } = await request.json()
    const supabase = await createClient()
    const { error } = await supabase.rpc('baixar_estoque_venda', { pedido_id })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro ao baixar estoque:', error)
    return NextResponse.json({ error: 'Erro ao baixar estoque' }, { status: 500 })
  }
}

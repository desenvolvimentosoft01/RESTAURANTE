import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // TODO: validar payload e inserir pedido no banco
    console.log('iFood webhook recebido:', body)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 })
  }
}

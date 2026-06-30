import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ItemIfood {
  name: string
  quantity: number
  unitPrice: { value: number }
  totalPrice: { value: number }
  observations?: string
  externalCode?: string
}

interface PayloadIfood {
  id: string
  reference?: string
  customer?: { name?: string }
  items: ItemIfood[]
  subTotal: { value: number }
  totalPrice: { value: number }
  benefits?: { sponsoredBy?: string; value?: { value: number } }[]
}

export async function POST(request: NextRequest) {
  try {
    const body: PayloadIfood = await request.json()

    if (!body.id || !Array.isArray(body.items)) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    const supabase = await createClient()

    const desconto = body.benefits?.reduce((s, b) => s + (b.value?.value ?? 0), 0) ?? 0

    const { data: pedido, error: errPedido } = await supabase
      .from('pedidos')
      .insert({
        origem: 'ifood',
        ifood_order_id: body.id,
        status: 'pendente',
        forma_pagamento: 'ifood',
        nome_cliente: body.customer?.name ?? null,
        subtotal: body.subTotal?.value ?? body.totalPrice.value,
        desconto,
        total: body.totalPrice.value,
      })
      .select()
      .single()

    if (errPedido) throw errPedido

    const itens = body.items.map((item) => ({
      pedido_id: pedido.id,
      produto_id: null,
      nome_produto: item.name,
      preco_unitario: item.unitPrice.value,
      quantidade: item.quantity,
      observacao: item.observations ?? null,
      subtotal: item.totalPrice.value,
    }))

    const { error: errItens } = await supabase.from('itens_pedido').insert(itens)
    if (errItens) throw errItens

    return NextResponse.json({ ok: true, pedido_id: pedido.id })
  } catch (error) {
    console.error('Erro no webhook iFood:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

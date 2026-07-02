import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Store, Bike } from 'lucide-react'
import { formatarMoeda, formatarData } from '@/lib/utils'
import { ImprimirCupomBtn } from '@/components/pedidos/ImprimirCupomBtn'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const STATUS_LABEL: Record<string, { label: string; cor: string }> = {
  pendente:   { label: 'Pendente',   cor: 'bg-amber-100 text-amber-700' },
  confirmado: { label: 'Confirmado', cor: 'bg-blue-100 text-blue-700' },
  em_preparo: { label: 'Em preparo', cor: 'bg-orange-100 text-orange-700' },
  pronto:     { label: 'Pronto',     cor: 'bg-green-100 text-green-700' },
  entregue:   { label: 'Entregue',   cor: 'bg-slate-100 text-slate-600' },
  cancelado:  { label: 'Cancelado',  cor: 'bg-red-100 text-red-700' },
}

const FORMA_LABEL: Record<string, string> = {
  dinheiro: 'Dinheiro',
  credito:  'Crédito',
  debito:   'Débito',
  pix:      'Pix',
  ifood:    'iFood',
}

export default async function PedidoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: pedido } = await supabase
    .from('pedidos')
    .select('*, itens:itens_pedido(*)')
    .eq('id', id)
    .single()

  if (!pedido) notFound()

  const status = STATUS_LABEL[pedido.status] ?? { label: pedido.status, cor: 'bg-slate-100 text-slate-600' }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pedidos" className="text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Detalhe do Pedido</h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">{pedido.id}</p>
        </div>
        <div className="ml-auto">
          <ImprimirCupomBtn pedido={pedido} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Origem</span>
            <div className="flex items-center gap-2">
              {pedido.origem === 'ifood' ? <Bike size={15} className="text-red-500" /> : <Store size={15} className="text-slate-600" />}
              <span className="text-sm font-medium capitalize">{pedido.origem === 'ifood' ? 'iFood' : 'Balcão'}</span>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Status</span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.cor}`}>{status.label}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Cliente</span>
            <span className="text-sm font-medium">{pedido.nome_cliente ?? '—'}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Pagamento</span>
            <span className="text-sm font-medium">{pedido.forma_pagamento ? FORMA_LABEL[pedido.forma_pagamento] : '—'}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Data</span>
            <span className="text-sm">{formatarData(pedido.created_at)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Itens do pedido</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-center">Qtd.</TableHead>
                <TableHead className="text-right">Unit.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {((pedido.itens ?? []) as import('@/types/database').ItemPedido[]).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{item.nome_produto}</p>
                    {item.observacao && (
                      <p className="text-xs text-slate-400 mt-0.5">{item.observacao}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{item.quantidade}</TableCell>
                  <TableCell className="text-right text-sm">{formatarMoeda(item.preco_unitario)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatarMoeda(item.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4 space-y-2">
          {pedido.desconto > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Desconto</span>
              <span className="text-red-600">− {formatarMoeda(pedido.desconto)}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-800">Total</span>
            <span className="text-2xl font-bold">{formatarMoeda(pedido.total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

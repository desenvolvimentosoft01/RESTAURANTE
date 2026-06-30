export default async function PedidoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Pedido #{id}</h1>
      <p className="text-slate-500">Detalhes do pedido — a implementar</p>
    </div>
  )
}

export type TipoMovimentacao = 'entrada' | 'saida' | 'ajuste'
export type OrigemPedido = 'balcao' | 'ifood'
export type StatusPedido = 'pendente' | 'confirmado' | 'em_preparo' | 'pronto' | 'entregue' | 'cancelado'
export type FormaPagamento = 'dinheiro' | 'credito' | 'debito' | 'pix' | 'ifood'
export type TipoTransacao = 'entrada' | 'saida'
export type CategoriaFinanceira =
  | 'venda'
  | 'compra_insumo'
  | 'salario'
  | 'aluguel'
  | 'energia'
  | 'agua'
  | 'gas'
  | 'manutencao'
  | 'outros'

export interface Categoria {
  id: string
  nome: string
  ativo: boolean
  ordem: number
}

export interface Produto {
  id: string
  categoria_id: string
  nome: string
  descricao: string | null
  preco: number
  imagem_url: string | null
  ativo: boolean
  disponivel_ifood: boolean
  categoria?: Categoria
}

export interface Ingrediente {
  id: string
  nome: string
  unidade: string
  quantidade_atual: number
  quantidade_minima: number
  preco_custo: number
}

export interface FichaTecnica {
  id: string
  produto_id: string
  ingrediente_id: string
  quantidade: number
  ingrediente?: Ingrediente
}

export interface MovimentacaoEstoque {
  id: string
  ingrediente_id: string
  tipo: TipoMovimentacao
  quantidade: number
  motivo: string | null
  pedido_id: string | null
  created_at: string
  ingrediente?: Ingrediente
}

export interface Pedido {
  id: string
  origem: OrigemPedido
  ifood_order_id: string | null
  status: StatusPedido
  forma_pagamento: FormaPagamento | null
  nome_cliente: string | null
  subtotal: number
  desconto: number
  total: number
  created_at: string
  updated_at: string
  itens?: ItemPedido[]
}

export interface ItemPedido {
  id: string
  pedido_id: string
  produto_id: string | null
  nome_produto: string
  preco_unitario: number
  quantidade: number
  observacao: string | null
  subtotal: number
}

export interface Transacao {
  id: string
  tipo: TipoTransacao
  categoria: CategoriaFinanceira
  descricao: string
  valor: number
  data_competencia: string
  pedido_id: string | null
  created_at: string
}

// Views
export interface ResumoFinanceiroHoje {
  total_entradas: number
  total_saidas: number
  saldo: number
}

export interface ProdutoMaisVendido {
  produto_id: string
  nome_produto: string
  total_quantidade: number
  total_receita: number
}

export interface AlertaEstoque {
  id: string
  nome: string
  unidade: string
  quantidade_atual: number
  quantidade_minima: number
}

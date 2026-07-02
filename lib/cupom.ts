import type { FormaPagamento, Pedido } from '@/types/database'

// Subconjunto de ItemPedido suficiente para o cupom — permite imprimir
// direto do PDV, onde os itens recém-gravados ainda não têm id em memória.
interface ItemCupom {
  nome_produto: string
  quantidade: number
  subtotal: number
  observacao?: string | null
}

const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  dinheiro: 'Dinheiro',
  credito: 'Cartão de Crédito',
  debito: 'Cartão de Débito',
  pix: 'Pix',
  ifood: 'iFood',
}

function esc(texto: string | null | undefined): string {
  return (texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function moeda(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Cupom não-fiscal em layout de bobina térmica 80mm (~302px).
// Abre em janela própria e dispara a impressão — não interfere no
// window.print() das telas (que imprime a página inteira).
export function imprimirCupom(pedido: Omit<Pedido, 'itens'> & { itens?: ItemCupom[] }) {
  const itens = pedido.itens ?? []
  const data = new Date(pedido.created_at).toLocaleString('pt-BR')
  const origem = pedido.origem === 'ifood' ? 'iFood' : 'Venda Balcão'

  const linhasItens = itens.map((i) => `
    <tr>
      <td class="qtd">${i.quantidade}×</td>
      <td class="nome">${esc(i.nome_produto)}${i.observacao ? `<br><span class="obs">Obs: ${esc(i.observacao)}</span>` : ''}</td>
      <td class="valor">${moeda(i.subtotal)}</td>
    </tr>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Cupom ${pedido.id.slice(0, 8)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 302px; font-family: 'Courier New', monospace; font-size: 12px; color: #000; padding: 8px; }
  .centro { text-align: center; }
  .titulo { font-size: 14px; font-weight: bold; }
  .separador { border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 2px 0; vertical-align: top; }
  .qtd { width: 28px; }
  .nome { padding-right: 4px; }
  .obs { font-size: 10px; }
  .valor { text-align: right; white-space: nowrap; }
  .total-linha td { font-size: 14px; font-weight: bold; padding-top: 4px; }
  .rodape { margin-top: 10px; font-size: 10px; }
  @media print { body { width: auto; } }
</style>
</head>
<body>
  <div class="centro">
    <p class="titulo">CUPOM NÃO FISCAL</p>
    <p>${origem}</p>
  </div>
  <div class="separador"></div>
  <p>Pedido: ${pedido.id.slice(0, 8).toUpperCase()}</p>
  <p>Data: ${data}</p>
  ${pedido.nome_cliente ? `<p>Cliente: ${esc(pedido.nome_cliente)}</p>` : ''}
  ${pedido.entregador ? `<p>Entregador: ${esc(pedido.entregador)}</p>` : ''}
  <div class="separador"></div>
  <table>
    ${linhasItens || '<tr><td colspan="3">(sem itens)</td></tr>'}
  </table>
  <div class="separador"></div>
  <table>
    <tr><td>Subtotal</td><td class="valor">${moeda(pedido.subtotal)}</td></tr>
    ${pedido.desconto > 0 ? `<tr><td>Desconto</td><td class="valor">-${moeda(pedido.desconto)}</td></tr>` : ''}
    <tr class="total-linha"><td>TOTAL</td><td class="valor">${moeda(pedido.total)}</td></tr>
    ${pedido.forma_pagamento ? `<tr><td>Pagamento</td><td class="valor">${FORMA_PAGAMENTO_LABEL[pedido.forma_pagamento]}</td></tr>` : ''}
  </table>
  <div class="separador"></div>
  <p class="rodape centro">Obrigado pela preferência!</p>
  <script>
    window.onload = function () {
      window.print();
      window.onafterprint = function () { window.close(); };
    };
  </script>
</body>
</html>`

  const largura = 380
  const altura = 640
  const left = Math.max(0, window.screenX + (window.outerWidth - largura) / 2)
  const top = Math.max(0, window.screenY + (window.outerHeight - altura) / 2)

  const janela = window.open('', '_blank', `width=${largura},height=${altura},left=${left},top=${top}`)
  if (!janela) return
  janela.document.write(html)
  janela.document.close()
}

import { getIfoodToken } from './auth'

const IFOOD_BASE_URL = 'https://merchant-api.ifood.com.br'

async function ifoodRequest(path: string, method = 'GET', body?: object) {
  const token = await getIfoodToken()
  const response = await fetch(`${IFOOD_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) throw new Error(`Erro iFood: ${response.statusText}`)
  return response.json()
}

export async function confirmarPedido(orderId: string) {
  return ifoodRequest(`/order/v1.0/orders/${orderId}/confirm`, 'POST')
}

export async function rejeitarPedido(orderId: string, motivo: string) {
  return ifoodRequest(`/order/v1.0/orders/${orderId}/requestCancellation`, 'POST', {
    cancellationCode: '501',
    description: motivo,
  })
}

export async function atualizarStatus(orderId: string, status: string) {
  return ifoodRequest(`/order/v1.0/orders/${orderId}/${status}`, 'POST')
}

const IFOOD_BASE_URL = 'https://merchant-api.ifood.com.br'

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export async function getIfoodToken(): Promise<string> {
  const response = await fetch(`${IFOOD_BASE_URL}/authentication/v1.0/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grantType: 'client_credentials',
      clientId: process.env.IFOOD_CLIENT_ID!,
      clientSecret: process.env.IFOOD_CLIENT_SECRET!,
    }),
  })

  if (!response.ok) throw new Error('Falha ao autenticar com iFood')

  const data: TokenResponse = await response.json()
  return data.access_token
}

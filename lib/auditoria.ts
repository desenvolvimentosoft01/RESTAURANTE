import type { AcaoAuditoria } from '@/types/database'

interface RegistrarAuditoriaParams {
  tela: string
  acao: AcaoAuditoria
  tabela: string
  registroId?: string | null
  antes?: Record<string, unknown> | null
  depois?: Record<string, unknown> | null
}

// Falha de auditoria nunca deve travar a ação principal do usuário —
// por isso os erros são só logados no console, sem toast nem throw.
export function registrarAuditoria(params: RegistrarAuditoriaParams) {
  fetch('/api/auditoria', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tela: params.tela,
      acao: params.acao,
      tabela: params.tabela,
      registro_id: params.registroId ?? null,
      dados_antes: params.antes ?? null,
      dados_depois: params.depois ?? null,
    }),
  }).catch((error) => {
    console.error('Erro ao registrar auditoria:', error)
  })
}

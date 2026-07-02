'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { registrarAuditoria } from '@/lib/auditoria'
import { Button } from '@/components/ui/button'

export function ReativarProdutoBtn({ id, nome }: { id: string; nome: string }) {
  const [salvando, setSalvando] = useState(false)
  const router = useRouter()

  async function reativar() {
    if (!confirm(`Reativar o produto "${nome}" no mix da loja?`)) return
    setSalvando(true)
    const supabase = createClient()
    const { error } = await supabase.from('produtos').update({ ativo: true }).eq('id', id)
    setSalvando(false)
    if (error) { toast.error('Erro ao reativar'); return }
    registrarAuditoria({ tela: 'Produtos Inativos', acao: 'ativacao', tabela: 'produtos', registroId: id, antes: { ativo: false }, depois: { ativo: true } })
    toast.success('Produto reativado')
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={reativar} disabled={salvando}>
      <RotateCcw size={13} className="mr-1.5" />
      {salvando ? 'Reativando...' : 'Reativar'}
    </Button>
  )
}

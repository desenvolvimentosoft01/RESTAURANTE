'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { registrarAuditoria } from '@/lib/auditoria'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export function DeletarContaBtn({ id, descricao }: { id: string; descricao: string }) {
  const [aberto, setAberto] = useState(false)
  const [deletando, setDeletando] = useState(false)
  const router = useRouter()

  async function deletar() {
    setDeletando(true)
    const supabase = createClient()
    const { error } = await supabase.from('contas').delete().eq('id', id)
    setDeletando(false)
    setAberto(false)
    if (error) { toast.error('Erro ao deletar'); return }
    registrarAuditoria({ tela: 'Financeiro/Contas', acao: 'exclusao', tabela: 'contas', registroId: id, antes: { descricao } })
    toast.success('Conta removida')
    router.refresh()
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setAberto(true)}>
        <Trash2 size={14} />
      </Button>
      <AlertDialog open={aberto} onOpenChange={setAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar conta?</AlertDialogTitle>
            <AlertDialogDescription>
              A conta <strong>{descricao}</strong> será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={deletar} disabled={deletando}>
              {deletando ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

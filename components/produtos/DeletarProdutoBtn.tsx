'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function DeletarProdutoBtn({ id, nome }: { id: string; nome: string }) {
  const [aberto, setAberto] = useState(false)
  const [deletando, setDeletando] = useState(false)
  const router = useRouter()

  async function deletar() {
    setDeletando(true)
    const supabase = createClient()
    const { error } = await supabase.from('produtos').delete().eq('id', id)
    setDeletando(false)
    setAberto(false)
    if (error) {
      toast.error('Erro ao deletar produto')
      return
    }
    toast.success('Produto removido')
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
            <AlertDialogTitle>Deletar produto?</AlertDialogTitle>
            <AlertDialogDescription>
              O produto <strong>{nome}</strong> será removido permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={deletar}
              disabled={deletando}
            >
              {deletando ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function MarcarPagoBtn({ id, tipo }: { id: string; tipo: string }) {
  const [marcando, setMarcando] = useState(false)
  const router = useRouter()

  async function marcar() {
    setMarcando(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('contas')
      .update({ pago: true, pago_em: new Date().toISOString().split('T')[0] })
      .eq('id', id)
    setMarcando(false)
    if (error) { toast.error('Erro ao atualizar'); return }
    toast.success(tipo === 'pagar' ? 'Conta marcada como paga!' : 'Marcado como recebido!')
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={marcar} disabled={marcando}>
      <CheckCircle size={13} className="mr-1.5" />
      {tipo === 'pagar' ? 'Pagar' : 'Receber'}
    </Button>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { registrarAuditoria } from '@/lib/auditoria'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { UnidadeMedida } from '@/types/database'

const UNIDADES_FRACIONADAS: UnidadeMedida[] = ['KG', 'G', 'L', 'ML']

interface Props {
  produtoId: string
  nomeProduto: string
  estoqueAtual: number
  unidadeMedida: UnidadeMedida
}

export function AjusteEstoqueBtn({ produtoId, nomeProduto, estoqueAtual, unidadeMedida }: Props) {
  const [aberto, setAberto] = useState(false)
  const [tipo, setTipo] = useState<'entrada' | 'saida' | 'ajuste'>('entrada')
  const [quantidade, setQuantidade] = useState(1)
  const [motivo, setMotivo] = useState('')
  const [salvando, setSalvando] = useState(false)
  const router = useRouter()
  const passo = UNIDADES_FRACIONADAS.includes(unidadeMedida) ? '0.001' : '1'

  async function salvar() {
    if (!quantidade || quantidade <= 0) {
      toast.error('Informe uma quantidade válida')
      return
    }
    setSalvando(true)
    const supabase = createClient()

    let novoEstoque = estoqueAtual
    if (tipo === 'entrada') novoEstoque = estoqueAtual + quantidade
    else if (tipo === 'saida') novoEstoque = Math.max(estoqueAtual - quantidade, 0)
    else novoEstoque = quantidade

    const [{ error: errMov }, { error: errProd }] = await Promise.all([
      supabase.from('movimentacoes_estoque_produto').insert({
        produto_id: produtoId,
        tipo,
        quantidade,
        motivo: motivo || null,
      }),
      supabase.from('produtos').update({ estoque_atual: novoEstoque }).eq('id', produtoId),
    ])

    setSalvando(false)

    if (errMov || errProd) {
      toast.error('Erro ao registrar ajuste')
      return
    }

    registrarAuditoria({
      tela: 'Estoque', acao: 'ajuste_estoque', tabela: 'produtos', registroId: produtoId,
      antes: { estoque_atual: estoqueAtual },
      depois: { estoque_atual: novoEstoque, tipo, quantidade, motivo: motivo || null },
    })

    toast.success('Estoque atualizado!')
    setAberto(false)
    setQuantidade(1)
    setMotivo('')
    router.refresh()
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setAberto(true)}>
        <SlidersHorizontal size={13} className="mr-1.5" />
        Ajustar
      </Button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ajustar Estoque</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm text-slate-500">Produto: <strong>{nomeProduto}</strong></p>
              <p className="text-sm text-slate-500">Estoque atual: <strong>{estoqueAtual} {unidadeMedida}</strong></p>
            </div>

            <div className="space-y-2">
              <Label>Tipo de movimentação</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as typeof tipo)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada (adicionar)</SelectItem>
                  <SelectItem value="saida">Saída (remover)</SelectItem>
                  <SelectItem value="ajuste">Ajuste (definir quantidade)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{tipo === 'ajuste' ? 'Nova quantidade total' : 'Quantidade'}</Label>
              <Input
                type="number"
                min="0"
                step={passo}
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Motivo (opcional)</Label>
              <Input
                placeholder="Ex: Compra fornecedor, perda..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>

            {tipo !== 'ajuste' && (
              <p className="text-xs text-slate-400 bg-slate-50 rounded-lg p-2">
                Novo estoque: <strong className="text-slate-700">
                  {tipo === 'entrada' ? estoqueAtual + quantidade : Math.max(estoqueAtual - quantidade, 0)} {unidadeMedida}
                </strong>
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import { Search } from 'lucide-react'

import { correspondeLike } from '@/lib/busca'
import { formatarDataCurta, formatarMoeda } from '@/lib/utils'
import { DeletarContaBtn } from './DeletarContaBtn'
import { MarcarPagoBtn } from './MarcarPagoBtn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Conta } from '@/types/database'

export function ContasConteudo({ contas }: { contas: Conta[] }) {
  const [buscaTexto, setBuscaTexto] = useState('')

  const filtradas = useMemo(
    () => contas.filter((c) => correspondeLike(c.descricao, buscaTexto) || correspondeLike(c.categoria, buscaTexto)),
    [contas, buscaTexto]
  )

  const apagar = filtradas.filter((c) => c.tipo === 'pagar' && !c.pago)
  const areceber = filtradas.filter((c) => c.tipo === 'receber' && !c.pago)
  const pagas = filtradas.filter((c) => c.pago)

  const totalPagar = apagar.reduce((s, c) => s + c.valor, 0)
  const totalReceber = areceber.reduce((s, c) => s + c.valor, 0)

  return (
    <div className="space-y-8">
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Pesquisar por descrição ou categoria..."
          value={buscaTexto}
          onChange={(e) => setBuscaTexto(e.target.value)}
          className="pl-9 h-9"
        />
        {buscaTexto && (
          <span className="text-xs text-slate-500 mt-1 block">{filtradas.length} de {contas.length} conta(s) encontrada(s)</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 rounded-xl border border-red-100 p-5">
          <p className="text-sm font-medium text-red-600">A Pagar</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{formatarMoeda(totalPagar)}</p>
          <p className="text-xs text-red-400 mt-1">{apagar.length} conta(s) pendente(s)</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-5">
          <p className="text-sm font-medium text-green-600">A Receber</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{formatarMoeda(totalReceber)}</p>
          <p className="text-xs text-green-400 mt-1">{areceber.length} conta(s) pendente(s)</p>
        </div>
      </div>

      <TabelaContas titulo="Contas a Pagar" contas={apagar} />
      <TabelaContas titulo="Contas a Receber" contas={areceber} />

      {pagas.length > 0 && (
        <TabelaContas titulo="Pagas / Recebidas" contas={pagas} />
      )}
    </div>
  )
}

function TabelaContas({ titulo, contas }: { titulo: string; contas: Conta[] }) {
  if (!contas.length) return null
  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">{titulo}</h2>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Descrição</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Categoria</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vencimento</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Valor</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contas.map((c) => {
              const vencido = !c.pago && new Date(c.vencimento) < new Date()
              return (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800 text-sm">{c.descricao}</p>
                    {c.observacao && <p className="text-xs text-slate-400 mt-0.5">{c.observacao}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-500 capitalize">{c.categoria ?? '—'}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-sm ${vencido ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                      {formatarDataCurta(c.vencimento)}
                      {vencido && <span className="ml-1 text-xs">⚠️</span>}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={`font-semibold text-sm ${c.tipo === 'pagar' ? 'text-red-600' : 'text-green-600'}`}>
                      {formatarMoeda(c.valor)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!c.pago && <MarcarPagoBtn id={c.id} tipo={c.tipo} />}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/financeiro/contas/${c.id}/editar`}>Editar</Link>
                      </Button>
                      <DeletarContaBtn id={c.id} descricao={c.descricao} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

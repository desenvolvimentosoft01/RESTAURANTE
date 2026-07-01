import { Loader2 } from 'lucide-react'

interface Props {
  texto?: string
}

export function Carregando({ texto = 'Carregando...' }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-slate-100" />
          <Loader2 className="absolute inset-0 h-16 w-16 animate-spin text-slate-800" />
        </div>
        <p className="text-slate-600 font-medium text-sm tracking-wide">{texto}</p>
      </div>
    </div>
  )
}

export function CarregandoInline() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
      <p className="text-slate-500 text-sm">Carregando...</p>
    </div>
  )
}

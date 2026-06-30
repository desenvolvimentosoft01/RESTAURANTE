import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function formatarData(data: string | Date, formato = 'dd/MM/yyyy HH:mm'): string {
  return format(new Date(data), formato, { locale: ptBR })
}

export function formatarDataCurta(data: string | Date): string {
  return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR })
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Aba {
  href: string
  label: string
  icone: string
}

interface TabsStore {
  abas: Aba[]
  abaAtiva: string
  abrirAba: (aba: Aba) => void
  fecharAba: (href: string) => void
  setAbaAtiva: (href: string) => void
}

const ABA_HOME: Aba = { href: '/', label: 'Dashboard', icone: '📊' }

export const useTabs = create<TabsStore>()(
  persist(
    (set, get) => ({
      abas: [ABA_HOME],
      abaAtiva: '/',

      abrirAba: (aba) => {
        const { abas } = get()
        const jaAberta = abas.find((a) => a.href === aba.href)
        if (!jaAberta) {
          set({ abas: [...abas, aba], abaAtiva: aba.href })
        } else {
          set({ abaAtiva: aba.href })
        }
      },

      fecharAba: (href) => {
        const { abas, abaAtiva } = get()
        // Não fecha a última aba
        if (abas.length === 1) return
        const idx = abas.findIndex((a) => a.href === href)
        const novasAbas = abas.filter((a) => a.href !== href)

        // Se fechou a aba ativa, ativa a anterior (ou próxima)
        let novaAtiva = abaAtiva
        if (href === abaAtiva) {
          novaAtiva = novasAbas[Math.max(0, idx - 1)].href
        }
        set({ abas: novasAbas, abaAtiva: novaAtiva })
      },

      setAbaAtiva: (href) => set({ abaAtiva: href }),
    }),
    {
      name: 'erp-tabs',
      // Não persiste entre sessões de forma excessiva — limpa ao abrir o sistema
      version: 1,
    }
  )
)

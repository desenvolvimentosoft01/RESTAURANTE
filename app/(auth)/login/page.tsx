import { FormularioLogin } from '@/components/auth/FormularioLogin'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-slate-900 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <div className="text-6xl mb-6">🍽️</div>
          <h2 className="text-3xl font-bold mb-4">Sistema ERP Restaurante</h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Gerencie pedidos, estoque, cardápio e finanças em um só lugar.
          </p>
          <div className="mt-8 space-y-3">
            {['PDV integrado com carrinho', 'Controle de estoque automático', 'Relatórios financeiros', 'Integração com iFood'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-slate-300">
                <span className="text-green-400">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <FormularioLogin />
      </div>
    </div>
  )
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // O Supabase SSR exige que a resposta seja criada antes do cliente para que
  // os cookies de sessão sejam propagados corretamente no cabeçalho de resposta.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Dupla escrita necessária: primeiro na request (para que o Server
          // Component leia no mesmo ciclo) e depois na response (para o browser).
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() valida o token no servidor a cada request — nunca confia apenas no cookie local.
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login')

  // Redireciona usuário não autenticado para login, exceto na própria página de login.
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Evita que usuário já logado acesse /login e fique em loop de redirect.
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  // Exclui assets estáticos e imagens do Next.js para não rodar autenticação
  // a cada fetch de recurso — impacto significativo de performance.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

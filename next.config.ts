import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Define a raiz explicitamente para evitar conflito de resolução de módulos
    // quando há projetos Next.js irmãos no mesmo diretório pai.
    root: path.join(__dirname),
  },
  // Oculta o indicador de build do Next.js no navegador — já desativado via
  // globals.css (nextjs-portal { display: none }), mas a flag evita o mount do elemento.
  devIndicators: false,
  experimental: {
    // Recharts é pesado e não está na lista padrão do Next — importa só os
    // módulos usados nos relatórios em vez do pacote inteiro.
    optimizePackageImports: ['recharts'],
  },
};

export default nextConfig;

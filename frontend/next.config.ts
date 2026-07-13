import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera .next/standalone com só os arquivos necessários pra rodar em
  // produção (usado pelo Dockerfile).
  output: "standalone",
  experimental: {
    // Padrão é 1MB; produtos digitais (PDFs) enviados via Server Action no
    // dashboard precisam de mais espaço.
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;

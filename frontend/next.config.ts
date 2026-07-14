import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera .next/standalone com só os arquivos necessários pra rodar em
  // produção (usado pelo Dockerfile).
  output: "standalone",
  // geoip-lite carrega arquivos .dat via fs em tempo de import; precisa
  // rodar com o require nativo do Node em vez de ser bundlizado pelo
  // Turbopack, senão o caminho do arquivo de dados quebra (ENOENT).
  serverExternalPackages: ["geoip-lite"],
  experimental: {
    // Padrão é 1MB; produtos digitais (PDFs) enviados via Server Action no
    // dashboard precisam de mais espaço.
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera .next/standalone com só os arquivos necessários pra rodar em
  // produção (usado pelo Dockerfile).
  output: "standalone",
  // geoip-lite carrega arquivos .dat via fs em tempo de import; precisa
  // rodar com o require nativo do Node em vez de ser bundlizado pelo
  // Turbopack, senão o caminho do arquivo de dados quebra (ENOENT).
  serverExternalPackages: ["geoip-lite"],
};

export default nextConfig;

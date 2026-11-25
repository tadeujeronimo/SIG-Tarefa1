import "./globals.css";

export const metadata = {
  title: "Coletor GPS | SIG-Web",
  description: "Coleta de coordenadas WGS 84 com Next.js e OpenStreetMap",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

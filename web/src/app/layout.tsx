import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GhostMessage",
  // --- 👇 AÑADE ESTO ---
  icons: {
    icon: '/icon.png', // Asegúrate de que tu PNG se llame icon.png y esté en src/app/
    // apple: '/apple-icon.png', // Opcional para Apple si tienes otro icono
  },
  // --- 👆 HASTA AQUÍ ---
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Fira+Code&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
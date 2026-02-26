import type { Metadata } from "next";
import { Tangerine } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const navBarFont = Tangerine({
  subsets: ["latin"],
  variable: "--font-navBar",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Quincho Doña Leonarda - Reservas",
  description: "Sistema de reservas online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${navBarFont.variable} antialiased bg-orange-50`} suppressHydrationWarning={true}>
        {/* La NavBar se renderiza una sola vez para toda la app */}
        <NavBar />
        <main className="h-screen w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
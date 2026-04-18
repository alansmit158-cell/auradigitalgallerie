import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Galerie Mustafa & Ahlem",
  description: "Partagez vos plus belles photos du mariage de Mustafa & Ahlem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${montserrat.variable} scroll-smooth`}>
      <body className="antialiased min-h-screen text-dark bg-white">
        {children}
      </body>
    </html>
  );
}

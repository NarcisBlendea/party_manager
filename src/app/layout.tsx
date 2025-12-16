import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ParticipantsProvider } from "@/context/ParticipantsContext";
import { ShoppingProvider } from "@/context/ShoppingContext";
import { ConfigProvider } from "@/context/ConfigContext";
import { MusicProvider } from "@/context/MusicContext";
import { AuthProvider } from "@/context/AuthContext";
import BackgroundEffects from "@/components/BackgroundEffects";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Revelion Manager",
  description: "Organizator pentru petrecerea de Revelion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased min-h-screen flex flex-col bg-transparent font-sans`}
      >
        <ConfigProvider>
          <AuthProvider>
            <BackgroundEffects />
            <ThemeSwitcher />
            <ParticipantsProvider>
              <ShoppingProvider>
                <MusicProvider>
                  <Navbar />
                  <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 relative z-10">
                    {children}
                  </main>
                  <footer className="text-white/60 text-center py-6 text-sm relative z-10">
                    <p>© {new Date().getFullYear()} EventManager. Let's party!</p>
                  </footer>
                </MusicProvider>
              </ShoppingProvider>
            </ParticipantsProvider>
          </AuthProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
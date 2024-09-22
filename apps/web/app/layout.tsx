import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono, Barlow } from "next/font/google";
import "./globals.css";
import { cn } from "@repo/ui/lib/utils";
import { SettingsProvider } from "~/context/settings";
import { SocketProvider } from "~/context/socket";
import { DataProvider } from "~/context/data";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const jetbrains_mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SocketProvider>
        <DataProvider>
          <SettingsProvider>
            <body
              className={cn(
                geistSans.variable,
                geistMono.variable,
                barlow.variable,
                jetbrains_mono.variable,
                "antialiased",
                "dark"
              )}
            >
              {children}
            </body>
          </SettingsProvider>
        </DataProvider>
      </SocketProvider>
    </html>
  );
}

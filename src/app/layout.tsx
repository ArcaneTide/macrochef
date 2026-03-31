import type { Metadata } from "next";
import { Outfit, DM_Serif_Display, Sora, Fraunces } from "next/font/google";
import { Providers } from "@/components/providers";
import { getDarkMode } from "@/lib/theme";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MacroΠie",
  description: "Macro-accurate meal plans for nutrition coaches",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDark = await getDarkMode();
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${dmSerifDisplay.variable} ${sora.variable} ${fraunces.variable}${isDark ? " dark" : ""}`}
    >
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

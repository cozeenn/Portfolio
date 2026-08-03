import type { Metadata, Viewport } from "next";
import { DM_Mono, Manrope, Syne } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reo Tan — Creative Developer",
  description:
    "Portfolio of Reo Anthony Tan, a creative web developer and UI/UX designer building sharp, responsive digital experiences.",
  applicationName: "Reo Tan Portfolio",
  authors: [{ name: "Reo Anthony Tan" }],
  creator: "Reo Anthony Tan",
  keywords: [
    "Reo Anthony Tan",
    "web developer",
    "UI/UX designer",
    "creative developer",
    "Philippines",
    "portfolio",
  ],
  icons: {
    icon: [{ url: "/assets/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/assets/favicon.svg",
  },
  openGraph: {
    type: "website",
    title: "Reo Tan — Creative Developer",
    description:
      "Selected work, capabilities, and digital experiments by Reo Anthony Tan.",
    siteName: "Reo Tan Portfolio",
  },
  twitter: {
    card: "summary",
    title: "Reo Tan — Creative Developer",
    description:
      "Selected work, capabilities, and digital experiments by Reo Anthony Tan.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080808",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${syne.variable} ${dmMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

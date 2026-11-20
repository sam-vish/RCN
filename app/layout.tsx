import type { Metadata, Viewport } from "next";
import { Sora, Source_Sans_3 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/layout/JsonLd";
import { VideoModalProvider } from "@/components/motion/VideoModal";
import { RevealObserver } from "@/components/motion/Reveal";
import { SITE_URL, site } from "@/content/site";
import { orgJsonLd, websiteJsonLd } from "@/lib/seo";

// RCN North America's own typefaces, as on the live rcnnorthamerica.com: Sora for headings,
// Source Sans 3 for text. (To use the AAO pairing instead, swap these for Cormorant Garamond +
// Manrope and point --font-display/--font-sans at them in globals.css.)
const display = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-face",
  display: "swap",
});

const text = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-text-face",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${site.name} | Remnant Christian Network`, template: `%s | ${site.name}` },
  description: `${site.tagline} ${site.intro} Find an apostolic church near you: 13 branches across the United States and Canada.`,
  applicationName: site.name,
  formatDetection: { telephone: false },
  icons: { icon: [{ url: "/brand/favicon-64.png", sizes: "64x64" }, { url: "/brand/icon.png", sizes: "512x512" }], apple: "/brand/apple-icon.png" },
  openGraph: { siteName: site.name, type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  robots: process.env.VERCEL_ENV === "preview" ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <head>
        {/* Reveal animations only when JS runs; without it, everything is simply visible. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <JsonLd data={[orgJsonLd, websiteJsonLd]} />
        <VideoModalProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </VideoModalProvider>
        <RevealObserver />
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import StoreProvider from "@/components/StoreProvider";
import { ReviewStatsProvider } from "@/components/ReviewStatsProvider";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import { getSiteSettings } from "@/lib/settings";
import TopBar from "@/components/TopBar";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CompareTray from "@/components/CompareTray";
import Toast from "@/components/Toast";
import CookieConsent from "@/components/CookieConsent";
import ScrollProgress from "@/components/ScrollProgress";
import SiteFx from "@/components/SiteFx";
import SiteChrome from "@/components/SiteChrome";
import JsonLd from "@/components/JsonLd";
import { organizationLd, websiteLd } from "@/lib/seo";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ltfse.com"),
  title: "L&T — Commercial Kitchen Equipment & Supply",
  description:
    "Panda® wok ranges, steamers, roasters, refrigeration and smallwares. Designed and built in New York, shipped nationwide.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "L&T Restaurant Equipment",
    url: "https://www.ltfse.com",
    title: "L&T — Commercial Kitchen Equipment & Supply",
    description:
      "Panda® wok ranges, steamers, roasters and automation — designed and built in New York, shipped nationwide.",
  },
  twitter: {
    card: "summary_large_image",
    title: "L&T — Commercial Kitchen Equipment & Supply",
    description:
      "Panda® wok ranges, steamers, roasters, refrigeration and smallwares — designed and built in New York, shipped nationwide.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {/* Warm up cross-origin connections (hero video, map tiles, backend) — Next hoists these to <head>. */}
        <link rel="preconnect" href="https://ltusa.s3.us-east-1.amazonaws.com" />
        <link rel="dns-prefetch" href="https://a.basemaps.cartocdn.com" />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin} />
        )}
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <AuthProvider>
          <StoreProvider>
            <SiteSettingsProvider value={settings}>
            <ReviewStatsProvider>
              <AnnouncementBanner />
              <SiteChrome>
                <ScrollProgress />
                <SiteFx />
                <TopBar />
                <Header />
                <MobileNav />
              </SiteChrome>
              <main id="main">{children}</main>
              <SiteChrome>
                <Footer />
                <CartDrawer />
                <CompareTray />
                <CookieConsent />
              </SiteChrome>
              <Toast />
            </ReviewStatsProvider>
            </SiteSettingsProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

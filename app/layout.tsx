import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/provider";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import { CompareProvider } from "@/contexts/compare-context";
import { FloatingCompareBar } from "@/components/compare/floating-compare-bar";
import { CompareModal } from "@/components/compare/compare-modal";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { MicrosoftClarity } from "@/components/analytics/microsoft-clarity";
import FooterSection from "@/components/homepage/footer";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://buyitforlife.com'),
  title: "BIFL - Buy It For Life Product Directory",
  description:
    "Discover durable, long-lasting products that are built to last. Expert reviews and ratings for quality items worth investing in.",
  openGraph: {
    title: "BIFL - Buy It For Life",
    description:
      "Discover durable, long-lasting products that are built to last. Expert reviews and ratings for quality items worth investing in.",
    url: "bifl.com",
    siteName: "BIFL",
    images: [
      {
        url: "https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/nsk-w9fFwBBmLDLxrB896I4xqngTUEEovS.png",
        width: 1200,
        height: 630,
        alt: "BIFL - Buy It For Life",
      },
    ],
    locale: "en-US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-[-apple-system,BlinkMacSystemFont]antialiased`}>
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
        <MicrosoftClarity projectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || ''} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <CompareProvider>
            <ConditionalNavbar />
            {children}
            <FooterSection />
            <FloatingCompareBar />
            <CompareModal />
            <Toaster />
            <Analytics />
          </CompareProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

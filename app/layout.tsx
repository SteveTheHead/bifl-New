import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/provider";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import { CompareProvider } from "@/contexts/compare-context";
import { AuthProvider } from "@/lib/contexts/auth-context";
import { FloatingCompareBar } from "@/components/compare/floating-compare-bar";
import { CompareModal } from "@/components/compare/compare-modal";
import { ConsentProvider } from "@/components/analytics/consent-context";
import { ConsentBanner } from "@/components/analytics/consent-banner";
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";
import { ExitIntentFeedback } from "@/components/exit-intent-feedback";
import FooterSection from "@/components/homepage/footer";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "BIFL - Buy It For Life Product Directory",
  description:
    "Discover durable, long-lasting products that are built to last. Community-verified reviews and ratings for quality items worth investing in.",
  openGraph: {
    title: "BIFL - Buy It For Life",
    description:
      "Discover durable, long-lasting products that are built to last. Community-verified reviews and ratings for quality items worth investing in.",
    url: siteUrl,
    siteName: "Buy It For Life",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
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
      <body className={`font-[-apple-system,BlinkMacSystemFont] antialiased`}>
        <ConsentProvider>
          {/* GA4 + Clarity load only after consent; Vercel Analytics/Speed
              Insights are cookieless and run unconditionally. */}
          <AnalyticsScripts
            gaMeasurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''}
            clarityProjectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || ''}
          />
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AuthProvider>
              <CompareProvider>
                <ConditionalNavbar />
                {/* Single main landmark for a11y (audit L6) */}
                <main id="main-content">{children}</main>
                <FooterSection />
                <FloatingCompareBar />
                <CompareModal />
                <ExitIntentFeedback />
                <Toaster />
                <Analytics />
                <SpeedInsights />
              </CompareProvider>
            </AuthProvider>
          </ThemeProvider>
          <ConsentBanner />
        </ConsentProvider>
      </body>
    </html>
  );
}

import { Metadata } from 'next'
import { getSubscriptionDetails } from "@/lib/subscription";
import PricingTable from "./_component/pricing-table";

// Force dynamic rendering (uses headers for subscription details)
export const dynamic = 'force-dynamic'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

export const metadata: Metadata = {
  title: 'Pricing - Buy It For Life',
  description: 'Choose a plan that works for you. Access expert BIFL reviews, buying guides, and community-verified product recommendations.',
  openGraph: {
    title: 'Pricing - Buy It For Life',
    description: 'Choose a plan that works for you. Access expert BIFL reviews, buying guides, and community-verified product recommendations.',
    url: `${baseUrl}/pricing`,
    siteName: 'Buy It For Life',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Pricing - Buy It For Life',
    description: 'Choose a plan that works for you. Access expert BIFL reviews and buying guides.',
  },
  alternates: {
    canonical: `${baseUrl}/pricing`,
  },
}

export default async function PricingPage() {
  const subscriptionDetails = await getSubscriptionDetails();

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen">
      <PricingTable subscriptionDetails={subscriptionDetails} />;
    </div>
  );
}

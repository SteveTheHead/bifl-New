import { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

export const metadata: Metadata = {
  title: 'How It Works - Our Curation Process | Buy It For Life',
  description: 'Learn how we research, score, and verify BIFL products. We analyze durability, repairability, warranty, and social consensus using real user data from Reddit, Amazon, and more.',
  keywords: [
    'how BIFL works',
    'product scoring methodology',
    'durability testing',
    'product research process',
    'buy it for life methodology'
  ],
  openGraph: {
    title: 'How It Works - Our Curation Process',
    description: 'Learn how we research, score, and verify BIFL products using real user data.',
    url: `${baseUrl}/how-it-works`,
    siteName: 'Buy It For Life',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'How It Works - Buy It For Life',
    description: 'Learn how we research, score, and verify BIFL products.',
  },
  alternates: {
    canonical: `${baseUrl}/how-it-works`,
  },
}

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

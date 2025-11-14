import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-brand-dark mb-3">Buy It For Life</h3>
            <p className="text-brand-gray mb-4 max-w-md">
              Community-verified durable, long-lasting products. We help you find quality items worth buying once.
            </p>
            <p className="text-sm text-brand-gray">
              © {new Date().getFullYear()} BuyItForLifeProducts.com. All rights reserved.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-sm font-semibold text-brand-dark uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-brand-gray hover:text-brand-teal transition-colors duration-150"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-brand-gray hover:text-brand-teal transition-colors duration-150"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/what-is-buy-it-for-life"
                  className="text-brand-gray hover:text-brand-teal transition-colors duration-150"
                >
                  What is BIFL?
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-brand-gray hover:text-brand-teal transition-colors duration-150"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-sm font-semibold text-brand-dark uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-brand-gray hover:text-brand-teal transition-colors duration-150"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-brand-gray hover:text-brand-teal transition-colors duration-150"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/affiliate-disclosure"
                  className="text-brand-gray hover:text-brand-teal transition-colors duration-150"
                >
                  Affiliate Disclosure
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Amazon Affiliate Disclaimer */}
        <div className="border-t border-gray-200 pt-8">
          <p className="text-xs text-brand-gray text-center max-w-4xl mx-auto">
            <strong>Affiliate Disclosure:</strong> BuyItForLifeProducts.com is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. We may earn a commission when you make a purchase through affiliate links, at no additional cost to you.
          </p>
        </div>
      </div>
    </footer>
  );
}

import { Metadata } from 'next'
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description: 'Affiliate Disclosure for Buy It For Life - How we earn commissions through product recommendations.',
}

export default function AffiliateDisclosure() {
  return (
    <div className="min-h-screen bg-brand-cream py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-brand-gray hover:text-brand-dark transition-colors"
          >
            ← Back to home
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-brand-dark mb-4">Affiliate Disclosure</h1>
          <p className="text-brand-gray mb-8">
            <strong>Last Updated:</strong> October 21, 2025
          </p>

          <div className="prose prose-lg max-w-none space-y-8 text-brand-gray">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mb-8">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">FTC Disclosure</h2>
              <p className="text-blue-800 font-medium">
                This website contains affiliate links. We may earn a commission when you make a purchase through these links, at no additional cost to you.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Amazon Associates Program</h2>
              <p className="leading-relaxed mb-4">
                BuyItForLifeProducts.com is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
              </p>
              <p className="leading-relaxed">
                When you click on product links on our website and make a purchase on Amazon, we may receive a small commission. This commission comes at no additional cost to you—you pay the same price you would pay if you visited Amazon directly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">How It Works</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-brand-dark mb-2">1. You Click a Product Link</h3>
                  <p className="leading-relaxed">
                    When you click on a product link on our website, you are redirected to Amazon (or another retailer) to complete your purchase.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-brand-dark mb-2">2. You Make a Purchase</h3>
                  <p className="leading-relaxed">
                    If you decide to purchase the product (or any other products during that Amazon session), Amazon tracks the sale.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-brand-dark mb-2">3. We Earn a Commission</h3>
                  <p className="leading-relaxed">
                    Amazon pays us a small percentage (typically 1-4%) of your qualifying purchase as a commission.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-brand-dark mb-2">4. No Extra Cost to You</h3>
                  <p className="leading-relaxed">
                    The price you pay is the same whether you use our affiliate link or go directly to Amazon. You do not pay any extra fees.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Our Editorial Independence</h2>
              <p className="leading-relaxed mb-4">
                <strong>Our reviews and recommendations are completely independent.</strong> The presence of affiliate links does not influence our product evaluations, ratings, or recommendations.
              </p>
              <p className="leading-relaxed mb-4">
                We evaluate products based on:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Durability and longevity</li>
                <li>Build quality and materials</li>
                <li>Repairability and serviceability</li>
                <li>Warranty and manufacturer support</li>
                <li>Sustainability and environmental impact</li>
                <li>Value for money</li>
                <li>User reviews and long-term performance data</li>
              </ul>
              <p className="leading-relaxed">
                We do not feature products simply because they offer higher affiliate commissions. Our goal is to help you find products that truly last a lifetime.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Why We Use Affiliate Links</h2>
              <p className="leading-relaxed mb-4">
                Creating comprehensive product reviews and maintaining this website requires significant time, research, and resources. Affiliate commissions help us:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cover operating costs:</strong> Hosting, domain registration, and tools</li>
                <li><strong>Fund research:</strong> Product testing, data analysis, and investigation</li>
                <li><strong>Create content:</strong> Detailed reviews, comparisons, and buying guides</li>
                <li><strong>Maintain the site:</strong> Updates, improvements, and new features</li>
                <li><strong>Keep content free:</strong> We don't charge readers to access our reviews</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Other Affiliate Relationships</h2>
              <p className="leading-relaxed mb-4">
                In addition to Amazon Associates, we may participate in other affiliate programs with retailers and manufacturers. These relationships operate on the same principles:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We earn a commission when you make a purchase through our links</li>
                <li>You pay the same price (or sometimes get a discount)</li>
                <li>Our editorial content remains independent and unbiased</li>
              </ul>
              <p className="leading-relaxed">
                When we have affiliate relationships with specific retailers, we clearly disclose them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Products We Recommend</h2>
              <p className="leading-relaxed mb-4">
                We feature products that we genuinely believe are worth recommending based on our "Buy It For Life" criteria. We consider:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Longevity:</strong> Products designed to last 10+ years</li>
                <li><strong>Quality:</strong> Superior materials and construction</li>
                <li><strong>Repairability:</strong> Products that can be maintained and repaired</li>
                <li><strong>Sustainability:</strong> Environmentally conscious choices</li>
                <li><strong>Value:</strong> Worth the investment over the long term</li>
              </ul>
              <p className="leading-relaxed">
                If a product doesn't meet our standards, we won't recommend it—regardless of potential affiliate earnings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Price Accuracy</h2>
              <p className="leading-relaxed mb-4">
                Product prices displayed on our website are shown for reference only and may not reflect real-time pricing. Prices can change frequently on retail sites.
              </p>
              <p className="leading-relaxed">
                <strong>The final price you see at checkout on the retailer's website is the price you will pay.</strong> We encourage you to verify pricing before completing your purchase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Your Choice to Support Us</h2>
              <p className="leading-relaxed mb-4">
                Using our affiliate links is entirely optional. You are free to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Go directly to Amazon or other retailers</li>
                <li>Search for products independently</li>
                <li>Compare prices across multiple retailers</li>
              </ul>
              <p className="leading-relaxed mb-4">
                <strong>If you find our content helpful and choose to use our affiliate links, thank you!</strong> Your support allows us to continue providing free, independent product reviews and recommendations.
              </p>
              <p className="leading-relaxed">
                If you prefer not to use affiliate links, we completely understand and respect your choice. You'll still have full access to all our reviews and content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Amazon Trademark Disclaimer</h2>
              <p className="leading-relaxed">
                Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates. We are not affiliated with, endorsed by, or sponsored by Amazon.com beyond our participation in the Amazon Associates Program.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Questions About Our Affiliate Relationships?</h2>
              <p className="leading-relaxed mb-4">
                We believe in full transparency. If you have any questions about our affiliate relationships, how we evaluate products, or our editorial process, please don't hesitate to contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="mb-2">
                  <strong>Email:</strong> affiliate@buyitforlife.com
                </p>
                <p>
                  <strong>Website:</strong> Contact form on our website
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">FTC Guidelines Compliance</h2>
              <p className="leading-relaxed">
                This disclosure is made in accordance with the Federal Trade Commission's 16 CFR Part 255: "Guides Concerning the Use of Endorsements and Testimonials in Advertising." We are required by the FTC to disclose our affiliate relationships and ensure transparency with our readers.
              </p>
            </section>

            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded mt-8">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Thank You for Your Support</h3>
              <p className="text-green-800">
                Your trust means everything to us. We're committed to providing honest, thorough, and independent product reviews to help you make informed purchasing decisions. When you support us through affiliate links, you help us continue this mission—and we're truly grateful.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

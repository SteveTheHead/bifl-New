import { Metadata } from 'next'
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Buy It For Life - The rules and guidelines for using our website.',
}

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-brand-dark mb-4">Terms of Service</h1>
          <p className="text-brand-gray mb-8">
            <strong>Last Updated:</strong> October 21, 2025
          </p>

          <div className="prose prose-lg max-w-none space-y-8 text-brand-gray">
            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                Welcome to BuyItForLifeProducts.com. By accessing or using our website, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our website.
              </p>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. Your continued use of the website after changes are posted constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Use of Website</h2>

              <h3 className="text-xl font-semibold text-brand-dark mb-3">2.1 Permitted Use</h3>
              <p className="leading-relaxed mb-4">
                You may use our website for lawful purposes only. You agree not to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful code, viruses, or malware</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Collect user information without consent</li>
                <li>Use automated systems to scrape content</li>
                <li>Impersonate any person or entity</li>
              </ul>

              <h3 className="text-xl font-semibold text-brand-dark mb-3">2.2 User Accounts</h3>
              <p className="leading-relaxed">
                If you create an account, you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Content and Intellectual Property</h2>

              <h3 className="text-xl font-semibold text-brand-dark mb-3">3.1 Our Content</h3>
              <p className="leading-relaxed mb-4">
                All content on this website, including but not limited to text, graphics, logos, images, product reviews, ratings, and software, is the property of BuyItForLifeProducts.com or its content suppliers and is protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="leading-relaxed">
                You may not reproduce, distribute, modify, create derivative works, publicly display, or exploit any of our content without our express written permission.
              </p>

              <h3 className="text-xl font-semibold text-brand-dark mb-3">3.2 User-Generated Content</h3>
              <p className="leading-relaxed mb-4">
                If you submit reviews, comments, or other content to our website, you grant us a non-exclusive, worldwide, royalty-free, perpetual license to use, reproduce, modify, and display such content in connection with our services.
              </p>
              <p className="leading-relaxed">
                You represent that you own or have the necessary rights to any content you submit and that such content does not violate any third-party rights or applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Product Reviews and Ratings</h2>
              <p className="leading-relaxed mb-4">
                The product reviews, ratings, and information provided on this website are for informational purposes only. They represent our opinions and analysis based on available information and research.
              </p>
              <p className="leading-relaxed mb-4">
                We strive to provide accurate and up-to-date information, but we make no warranties or representations about the accuracy, completeness, or reliability of any information on the website.
              </p>
              <p className="leading-relaxed">
                Your purchase decisions should be based on your own research and judgment. We are not responsible for any decisions you make based on information provided on this website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Affiliate Relationships and Disclaimers</h2>
              <p className="leading-relaxed mb-4">
                BuyItForLifeProducts.com participates in the Amazon Services LLC Associates Program and may earn commissions from qualifying purchases made through affiliate links on our website.
              </p>
              <p className="leading-relaxed mb-4">
                When you click on an affiliate link and make a purchase, we may receive a commission at no additional cost to you. These affiliate relationships do not influence our product reviews or recommendations, which are based on our independent analysis.
              </p>
              <p className="leading-relaxed">
                We are not responsible for the products, services, or content provided by third-party retailers, including Amazon. All transactions are between you and the third-party retailer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Third-Party Links</h2>
              <p className="leading-relaxed">
                Our website contains links to third-party websites. These links are provided for your convenience only. We do not endorse, control, or assume responsibility for the content, privacy policies, or practices of any third-party websites. You access third-party websites at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Disclaimer of Warranties</h2>
              <p className="leading-relaxed mb-4">
                OUR WEBSITE AND ALL CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Warranties of merchantability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Accuracy, completeness, or reliability of content</li>
                <li>Uninterrupted or error-free operation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">8. Limitation of Liability</h2>
              <p className="leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, BUYITFORLIFEPRODUCTS.COM SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Your use or inability to use our website</li>
                <li>Any unauthorized access to or use of our servers</li>
                <li>Any interruption or cessation of transmission to or from our website</li>
                <li>Any bugs, viruses, or similar harmful code</li>
                <li>Any errors or omissions in any content</li>
                <li>Any loss or damage resulting from purchase decisions based on our content</li>
              </ul>
              <p className="leading-relaxed">
                IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID US IN THE PAST TWELVE MONTHS, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS LESS.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">9. Indemnification</h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless BuyItForLifeProducts.com and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with your access to or use of our website, your violation of these Terms, or your violation of any rights of another.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">10. Copyright Infringement</h2>
              <p className="leading-relaxed mb-4">
                We respect intellectual property rights. If you believe that content on our website infringes your copyright, please contact us with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>A description of the copyrighted work</li>
                <li>A description of where the infringing material is located</li>
                <li>Your contact information</li>
                <li>A statement of good faith belief that the use is not authorized</li>
                <li>A statement that the information is accurate and you are authorized to act</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">11. Termination</h2>
              <p className="leading-relaxed">
                We reserve the right to terminate or suspend your access to our website, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the website will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">12. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. You agree to submit to the personal and exclusive jurisdiction of the courts located within the United States.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">13. Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the website after such changes constitutes your acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">14. Severability</h2>
              <p className="leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">15. Contact Information</h2>
              <p className="leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="mb-2">
                  <strong>Email:</strong> legal@buyitforlife.com
                </p>
                <p>
                  <strong>Website:</strong> Contact form on our website
                </p>
              </div>
            </section>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded mt-8">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Important Notice</h3>
              <p className="text-amber-800">
                Please read these Terms carefully before using our website. By using BuyItForLifeProducts.com, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

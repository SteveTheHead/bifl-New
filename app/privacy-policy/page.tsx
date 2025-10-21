import { Metadata } from 'next'
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Buy It For Life - How we collect, use, and protect your information.',
}

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold text-brand-dark mb-4">Privacy Policy</h1>
          <p className="text-brand-gray mb-8">
            <strong>Last Updated:</strong> October 21, 2025
          </p>

          <div className="prose prose-lg max-w-none space-y-8 text-brand-gray">
            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                Welcome to Buy It For Life ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
              </p>
              <p className="leading-relaxed">
                By using our website, you consent to the data practices described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-brand-dark mb-3">2.1 Personal Information</h3>
              <p className="leading-relaxed mb-4">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Register for an account</li>
                <li>Subscribe to our newsletter</li>
                <li>Save products to your favorites</li>
                <li>Contact us through our contact form</li>
                <li>Submit reviews or comments</li>
              </ul>
              <p className="leading-relaxed mb-4">
                This information may include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Name</li>
                <li>Email address</li>
                <li>Profile information</li>
                <li>User preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-brand-dark mb-3">2.2 Automatically Collected Information</h3>
              <p className="leading-relaxed mb-4">
                When you visit our website, we automatically collect certain information about your device and browsing activity:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Pages viewed and time spent on pages</li>
                <li>Referring website addresses</li>
                <li>Click patterns and navigation paths</li>
              </ul>

              <h3 className="text-xl font-semibold text-brand-dark mb-3">2.3 Cookies and Tracking Technologies</h3>
              <p className="leading-relaxed">
                We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors are coming from. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">3. How We Use Your Information</h2>
              <p className="leading-relaxed mb-4">
                We use the information we collect for various purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>To provide and maintain our service:</strong> Including managing your account and providing customer support</li>
                <li><strong>To improve our website:</strong> Understanding how users interact with our site to enhance functionality and user experience</li>
                <li><strong>To personalize content:</strong> Showing you relevant product recommendations based on your interests</li>
                <li><strong>To communicate with you:</strong> Sending updates, newsletters, and promotional materials (with your consent)</li>
                <li><strong>To analyze usage:</strong> Using analytics tools like Google Analytics to understand site performance</li>
                <li><strong>To comply with legal obligations:</strong> Meeting regulatory requirements and responding to legal requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Amazon Affiliate Program</h2>
              <p className="leading-relaxed mb-4">
                We participate in the Amazon Services LLC Associates Program, an affiliate advertising program. When you click on Amazon links on our site and make a purchase, we may earn a small commission at no additional cost to you.
              </p>
              <p className="leading-relaxed">
                Amazon may collect information about your browsing and purchasing behavior through their own cookies and tracking technologies. Please refer to Amazon's Privacy Policy for more information about how they handle your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Information Sharing and Disclosure</h2>
              <p className="leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> We work with third-party service providers who perform services on our behalf (e.g., hosting, analytics, email delivery). These providers have access to your information only to perform specific tasks and are obligated to protect your data.</li>
                <li><strong>Analytics Services:</strong> We use Google Analytics and similar services to analyze website traffic. These services may collect information about your use of our site.</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or in response to valid legal requests.</li>
                <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Data Security</h2>
              <p className="leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Encryption of data in transit using SSL/TLS</li>
                <li>Secure password hashing</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
              </ul>
              <p className="leading-relaxed">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Your Rights and Choices</h2>
              <p className="leading-relaxed mb-4">
                You have certain rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> You can request access to the personal information we hold about you</li>
                <li><strong>Correction:</strong> You can update or correct your account information at any time</li>
                <li><strong>Deletion:</strong> You can request deletion of your account and associated data</li>
                <li><strong>Opt-out:</strong> You can unsubscribe from marketing emails by clicking the unsubscribe link in any email</li>
                <li><strong>Cookie Control:</strong> You can manage cookie preferences through your browser settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">8. Children's Privacy</h2>
              <p className="leading-relaxed">
                Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us, and we will take steps to delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">9. Changes to This Privacy Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">10. Contact Us</h2>
              <p className="leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="mb-2">
                  <strong>Email:</strong> privacy@buyitforlife.com
                </p>
                <p>
                  <strong>Website:</strong> Contact form on our website
                </p>
              </div>
            </section>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mt-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Your Privacy Matters</h3>
              <p className="text-blue-800">
                We are committed to protecting your privacy and being transparent about our data practices. If you have any questions or concerns about how we handle your information, please don't hesitate to reach out to us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

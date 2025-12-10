import { Metadata } from "next"
import Link from "next/link"

const pageTitle = "BIFL Scoring Methodology | How We Rate Products for Longevity"
const pageDescription = "Our transparent scoring methodology explains exactly how we evaluate products on durability, repairability, warranty, sustainability, and social consensus using a 0-10 scale."

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/scoring-methodology",
    siteName: "Buy It For Life",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
}

const scoringMethodologySchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "BIFL Scoring Methodology: How We Rate Products for Longevity",
  "description": "A detailed explanation of how Buy It For Life Products evaluates and scores products using our proprietary 5-factor methodology.",
  "author": {
    "@type": "Organization",
    "name": "Buy It For Life Products",
    "url": "https://buyitforlifeproducts.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Buy It For Life Products",
    "url": "https://buyitforlifeproducts.com"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://buyitforlifeproducts.com/scoring-methodology"
  }
}

export default function ScoringMethodologyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(scoringMethodologySchema) }}
      />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="py-16 bg-brand-cream">
          <div className="container mx-auto px-6 max-w-4xl">
            <h1 className="text-4xl font-serif font-bold text-brand-dark mb-4">
              BIFL Scoring Methodology
            </h1>
            <p className="text-xl text-brand-gray">
              How we evaluate products for true longevity using data, not opinions.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <article className="py-12">
          <div className="container mx-auto px-6 max-w-4xl prose prose-lg">

            {/* Overview */}
            <section className="mb-12">
              <h2 className="text-2xl font-serif font-bold text-brand-dark mb-4">
                Overview: The BIFL Total Score
              </h2>
              <p className="text-brand-gray mb-4">
                Every product on Buy It For Life Products receives a <strong>BIFL Total Score</strong> on
                a scale of 0 to 10. This score represents our assessment of how well a product meets the
                &ldquo;buy it for life&rdquo; standard: exceptional durability, repairability, and long-term value.
              </p>
              <p className="text-brand-gray mb-4">
                The BIFL Total Score reflects our overall assessment based on five individual factor scores,
                each rated 0-10. These factors are prioritized based on their importance to product longevity:
              </p>

              <div className="bg-brand-cream rounded-lg p-6 my-6">
                <h3 className="text-lg font-semibold text-brand-dark mb-3">Score Weighting Formula</h3>
                <p className="text-brand-gray mb-3">
                  The BIFL Total Score is calculated using the following weighted formula:
                </p>
                <ul className="space-y-2 text-brand-gray">
                  <li><strong>Durability:</strong> 30% weight</li>
                  <li><strong>Social Consensus:</strong> 30% weight</li>
                  <li><strong>Warranty:</strong> 20% weight</li>
                  <li><strong>Repairability:</strong> 20% weight</li>
                </ul>
                <p className="text-brand-gray mt-4 p-3 bg-white rounded border border-gray-200 font-mono text-sm">
                  BIFL Total = (Durability × 0.3) + (Social × 0.3) + (Warranty × 0.2) + (Repairability × 0.2)
                </p>
                <p className="text-brand-gray mt-3 text-sm">
                  <strong>Note:</strong> Sustainability is tracked as a separate metric but is not included
                  in the total score calculation. This reflects the BIFL philosophy that longevity itself
                  is the most sustainable choice - a product that lasts 20 years has far less environmental
                  impact than one replaced every 2 years, regardless of materials.
                </p>
              </div>
            </section>

            {/* Score Interpretation */}
            <section className="mb-12">
              <h2 className="text-2xl font-serif font-bold text-brand-dark mb-4">
                Score Interpretation Guide
              </h2>
              <p className="text-brand-gray mb-4">
                Here&apos;s what each score range means for product quality and longevity:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse my-6">
                  <thead>
                    <tr className="bg-brand-cream">
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Score Range</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Rating</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">What It Means</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3"><span className="text-green-600 font-semibold">9.0 - 10.0</span></td>
                      <td className="border border-gray-200 px-4 py-3">Exceptional</td>
                      <td className="border border-gray-200 px-4 py-3">True BIFL legend. Industry benchmark for longevity.</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3"><span className="text-green-600 font-semibold">8.0 - 8.9</span></td>
                      <td className="border border-gray-200 px-4 py-3">Excellent</td>
                      <td className="border border-gray-200 px-4 py-3">Outstanding quality. Expected to last decades with care.</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3"><span className="text-yellow-600 font-semibold">7.0 - 7.9</span></td>
                      <td className="border border-gray-200 px-4 py-3">Very Good</td>
                      <td className="border border-gray-200 px-4 py-3">Solid long-term choice. Minor compromises possible.</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3"><span className="text-yellow-600 font-semibold">6.0 - 6.9</span></td>
                      <td className="border border-gray-200 px-4 py-3">Good</td>
                      <td className="border border-gray-200 px-4 py-3">Above average durability. Good value for price.</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3"><span className="text-orange-600 font-semibold">5.0 - 5.9</span></td>
                      <td className="border border-gray-200 px-4 py-3">Fair</td>
                      <td className="border border-gray-200 px-4 py-3">Average product. May need replacement within 5-10 years.</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3"><span className="text-red-600 font-semibold">Below 5.0</span></td>
                      <td className="border border-gray-200 px-4 py-3">Below Average</td>
                      <td className="border border-gray-200 px-4 py-3">Not recommended for BIFL purposes.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* The Five Factors */}
            <section className="mb-12">
              <h2 className="text-2xl font-serif font-bold text-brand-dark mb-6">
                The Five Scoring Factors Explained
              </h2>

              {/* Durability */}
              <div className="bg-white border-l-4 border-brand-teal pl-6 py-4 mb-8">
                <h3 className="text-xl font-semibold text-brand-dark mb-3">
                  1. Durability Score (30% weight)
                </h3>
                <p className="text-brand-gray mb-3">
                  Durability measures how well a product withstands regular use over time. This is the
                  most heavily weighted factor because it directly determines product lifespan.
                </p>
                <p className="text-brand-gray mb-3"><strong>What we evaluate:</strong></p>
                <ul className="list-disc list-inside text-brand-gray space-y-1 mb-3">
                  <li>Material quality (steel vs. plastic, leather vs. synthetic)</li>
                  <li>Construction method (welded vs. glued, stitched vs. bonded)</li>
                  <li>Stress point reinforcement</li>
                  <li>Resistance to wear, corrosion, and environmental factors</li>
                  <li>Real-world longevity reports from long-term owners</li>
                </ul>
                <p className="text-brand-gray">
                  <strong>Score of 9-10:</strong> Products built with premium materials (full-grain leather,
                  stainless steel, solid hardwood) using industrial-grade construction. Expected lifespan:
                  20+ years with normal use.
                </p>
              </div>

              {/* Social Consensus */}
              <div className="bg-white border-l-4 border-brand-teal pl-6 py-4 mb-8">
                <h3 className="text-xl font-semibold text-brand-dark mb-3">
                  2. Social Consensus Score (30% weight)
                </h3>
                <p className="text-brand-gray mb-3">
                  Social consensus captures the collective wisdom of long-term product owners. We weight
                  this equally with durability because real-world experience over years reveals issues that spec sheets cannot.
                </p>
                <p className="text-brand-gray mb-3"><strong>Data sources we analyze:</strong></p>
                <ul className="list-disc list-inside text-brand-gray space-y-1 mb-3">
                  <li>Reddit communities (r/BuyItForLife, product-specific subreddits)</li>
                  <li>Amazon reviews filtered for verified purchases and ownership duration</li>
                  <li>Specialty forums and enthusiast communities</li>
                  <li>Professional reviews from durability-focused publications</li>
                </ul>
                <p className="text-brand-gray">
                  <strong>Score of 9-10:</strong> Near-universal praise from owners who&apos;ve used the product
                  for 5+ years. Frequently recommended in &ldquo;what lasts forever&rdquo; discussions.
                </p>
              </div>

              {/* Warranty */}
              <div className="bg-white border-l-4 border-brand-teal pl-6 py-4 mb-8">
                <h3 className="text-xl font-semibold text-brand-dark mb-3">
                  3. Warranty Score (20% weight)
                </h3>
                <p className="text-brand-gray mb-3">
                  Warranty length and comprehensiveness signal manufacturer confidence in their product.
                  A strong warranty also provides practical protection for your purchase.
                </p>
                <p className="text-brand-gray mb-3"><strong>What we evaluate:</strong></p>
                <ul className="list-disc list-inside text-brand-gray space-y-1 mb-3">
                  <li>Warranty duration (1 year vs. lifetime)</li>
                  <li>Coverage scope (defects only vs. wear and tear)</li>
                  <li>Claim process reputation (easy vs. difficult)</li>
                  <li>Transferability to second owners</li>
                  <li>History of honoring warranty claims</li>
                </ul>
                <p className="text-brand-gray">
                  <strong>Score of 10:</strong> Lifetime warranty with documented history of hassle-free
                  replacements. Companies like L.L.Bean, Darn Tough, and YETI exemplify this standard.
                </p>
              </div>

              {/* Repairability */}
              <div className="bg-white border-l-4 border-brand-teal pl-6 py-4 mb-8">
                <h3 className="text-xl font-semibold text-brand-dark mb-3">
                  4. Repairability Score (20% weight)
                </h3>
                <p className="text-brand-gray mb-3">
                  Even the best products eventually need maintenance or repair. Products that can be
                  serviced extend their useful life significantly.
                </p>
                <p className="text-brand-gray mb-3"><strong>What we evaluate:</strong></p>
                <ul className="list-disc list-inside text-brand-gray space-y-1 mb-3">
                  <li>Availability of replacement parts (OEM and third-party)</li>
                  <li>Ease of disassembly (screws vs. glue, standard vs. proprietary)</li>
                  <li>Repair documentation and guides</li>
                  <li>Local repair shop compatibility</li>
                  <li>Manufacturer repair service availability</li>
                </ul>
                <p className="text-brand-gray">
                  <strong>Score of 9-10:</strong> Parts readily available for 10+ years. Can be repaired
                  with common tools. Active repair community or manufacturer service program.
                </p>
              </div>

              {/* Sustainability */}
              <div className="bg-white border-l-4 border-brand-teal pl-6 py-4 mb-8">
                <h3 className="text-xl font-semibold text-brand-dark mb-3">
                  5. Sustainability Score (supplementary)
                </h3>
                <p className="text-brand-gray mb-3">
                  Sustainability is tracked separately and <strong>not included in the BIFL Total Score</strong>.
                  We believe longevity IS sustainability - a product that lasts 20 years has far less environmental
                  impact than one replaced every 2 years, regardless of materials used.
                </p>
                <p className="text-brand-gray mb-3"><strong>What we evaluate:</strong></p>
                <ul className="list-disc list-inside text-brand-gray space-y-1 mb-3">
                  <li>Manufacturing location and labor practices</li>
                  <li>Material sourcing (recycled, organic, responsibly harvested)</li>
                  <li>Packaging minimalism and recyclability</li>
                  <li>End-of-life recyclability or biodegradability</li>
                  <li>Company environmental certifications (B Corp, etc.)</li>
                </ul>
                <p className="text-brand-gray">
                  <strong>Score of 9-10:</strong> Certified sustainable materials, ethical manufacturing,
                  minimal packaging, and take-back or recycling programs.
                </p>
              </div>
            </section>

            {/* Detailed Scoring Rubric */}
            <section className="mb-12">
              <h2 className="text-2xl font-serif font-bold text-brand-dark mb-4">
                Detailed Scoring Rubric
              </h2>
              <p className="text-brand-gray mb-6">
                Each score from 1-10 has specific criteria. Here&apos;s exactly what each score level means:
              </p>

              {/* Durability Rubric */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-brand-dark mb-3">Durability Rubric</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-brand-cream">
                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold w-16">Score</th>
                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="border border-gray-200 px-3 py-2 font-medium text-red-600">1-2</td><td className="border border-gray-200 px-3 py-2">Fails almost immediately. Materials feel flimsy or defective. Breaks under light use. Commonly returned within weeks.</td></tr>
                      <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2 font-medium text-orange-600">3-4</td><td className="border border-gray-200 px-3 py-2">Often lasts under a year. Material fatigue occurs quickly. Average build quality with early wear signs. Not for frequent use.</td></tr>
                      <tr><td className="border border-gray-200 px-3 py-2 font-medium text-yellow-600">5-6</td><td className="border border-gray-200 px-3 py-2">Acceptable performance, 2-5 years with care. Good structural integrity. Minor wear doesn&apos;t compromise function.</td></tr>
                      <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2 font-medium text-green-600">7-8</td><td className="border border-gray-200 px-3 py-2">Built to last 5-10+ years. Excellent durability with minimal degradation. Customers report using for a decade or more.</td></tr>
                      <tr><td className="border border-gray-200 px-3 py-2 font-medium text-green-700">9-10</td><td className="border border-gray-200 px-3 py-2">Premium construction. Virtually indestructible. Industry benchmark. Over-engineered to outlast competition. Passed down generations.</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Social Consensus Rubric */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-brand-dark mb-3">Social Consensus Rubric</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-brand-cream">
                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold w-16">Score</th>
                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="border border-gray-200 px-3 py-2 font-medium text-red-600">1-2</td><td className="border border-gray-200 px-3 py-2">Overwhelmingly negative sentiment. Frequent keywords: &ldquo;broke,&rdquo; &ldquo;junk,&rdquo; &ldquo;disappointed.&rdquo; Star ratings below 2.5.</td></tr>
                      <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2 font-medium text-orange-600">3-4</td><td className="border border-gray-200 px-3 py-2">Mixed but mostly negative. Balanced mix of good and bad. Rarely recommended in Reddit/forums.</td></tr>
                      <tr><td className="border border-gray-200 px-3 py-2 font-medium text-yellow-600">5-6</td><td className="border border-gray-200 px-3 py-2">Positive trend across multiple sites. ~4.0 star rating. Early BIFL mentions appear. Moderate review volume.</td></tr>
                      <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2 font-medium text-green-600">7-8</td><td className="border border-gray-200 px-3 py-2">High star rating (4.5+) with hundreds of reviews. Mentioned as go-to on Reddit. Strong word-of-mouth.</td></tr>
                      <tr><td className="border border-gray-200 px-3 py-2 font-medium text-green-700">9-10</td><td className="border border-gray-200 px-3 py-2">Iconic BIFL status. Universally trusted across all channels. Keywords: &ldquo;best,&rdquo; &ldquo;bulletproof,&rdquo; &ldquo;had it for years.&rdquo;</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Warranty Rubric */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-brand-dark mb-3">Warranty Rubric</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-brand-cream">
                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold w-16">Score</th>
                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="border border-gray-200 px-3 py-2 font-medium text-red-600">1-2</td><td className="border border-gray-200 px-3 py-2">No warranty or less than 3 months. Impossible to claim. Buyer assumes all risk.</td></tr>
                      <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2 font-medium text-orange-600">3-4</td><td className="border border-gray-200 px-3 py-2">6-month to 1-year warranty with hoops to jump through. Customer covers shipping.</td></tr>
                      <tr><td className="border border-gray-200 px-3 py-2 font-medium text-yellow-600">5-6</td><td className="border border-gray-200 px-3 py-2">1-3 year warranty with acceptable support. Company resolves most issues fairly.</td></tr>
                      <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2 font-medium text-green-600">7-8</td><td className="border border-gray-200 px-3 py-2">5+ year warranty. Extended coverage included. Company exceeds expectations on claims.</td></tr>
                      <tr><td className="border border-gray-200 px-3 py-2 font-medium text-green-700">9-10</td><td className="border border-gray-200 px-3 py-2">Lifetime warranty with hassle-free replacement. Legendary reputation. Replaces without questions.</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Repairability Rubric */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-brand-dark mb-3">Repairability Rubric</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-brand-cream">
                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold w-16">Score</th>
                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="border border-gray-200 px-3 py-2 font-medium text-red-600">1-2</td><td className="border border-gray-200 px-3 py-2">Impossible to repair. Sealed or glued shut. No parts available. Repair attempts cause more damage.</td></tr>
                      <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2 font-medium text-orange-600">3-4</td><td className="border border-gray-200 px-3 py-2">Limited repair potential. Specialized tools required. Only experts can repair. Few guides available.</td></tr>
                      <tr><td className="border border-gray-200 px-3 py-2 font-medium text-yellow-600">5-6</td><td className="border border-gray-200 px-3 py-2">Mostly repairable. Brand may provide parts. Common tools suffice. Community support exists.</td></tr>
                      <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2 font-medium text-green-600">7-8</td><td className="border border-gray-200 px-3 py-2">Strong right-to-repair support. Modular design. Great aftermarket parts. YouTube/forum guides available.</td></tr>
                      <tr><td className="border border-gray-200 px-3 py-2 font-medium text-green-700">9-10</td><td className="border border-gray-200 px-3 py-2">Gold standard repairability. Manufacturer offers repair kits. Even beginners can fix. Long-term repair commitment.</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sustainability Rubric */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-brand-dark mb-3">Sustainability Rubric (Supplementary)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-brand-cream">
                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold w-16">Score</th>
                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="border border-gray-200 px-3 py-2 font-medium text-red-600">1-2</td><td className="border border-gray-200 px-3 py-2">Actively harmful practices. Single-use or toxic materials. Wasteful packaging. Unknown supply chains.</td></tr>
                      <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2 font-medium text-orange-600">3-4</td><td className="border border-gray-200 px-3 py-2">Claims sustainability but lacks certifications. Little transparency on sourcing. Zero carbon tracking.</td></tr>
                      <tr><td className="border border-gray-200 px-3 py-2 font-medium text-yellow-600">5-6</td><td className="border border-gray-200 px-3 py-2">Brand improving sustainability. Some recyclable parts. Company offsets carbon. Reduced emissions.</td></tr>
                      <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2 font-medium text-green-600">7-8</td><td className="border border-gray-200 px-3 py-2">Recyclable product with verified supply chain. Carbon-neutral facilities. Ethical labor and regional sourcing.</td></tr>
                      <tr><td className="border border-gray-200 px-3 py-2 font-medium text-green-700">9-10</td><td className="border border-gray-200 px-3 py-2">Global sustainability leader. Third-party certified. Carbon negative. Cradle-to-cradle design. Minimal impact lifecycle.</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Badge System */}
            <section className="mb-12">
              <h2 className="text-2xl font-serif font-bold text-brand-dark mb-4">
                BIFL Badge Criteria
              </h2>
              <p className="text-brand-gray mb-4">
                Products that meet specific thresholds earn badges that highlight their strengths:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse my-6">
                  <thead>
                    <tr className="bg-brand-cream">
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Badge</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Requirement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3 font-medium">Gold Standard</td>
                      <td className="border border-gray-200 px-4 py-3">BIFL Total Score of 9.0 or higher</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 font-medium">BIFL Approved</td>
                      <td className="border border-gray-200 px-4 py-3">Score of 7.5+ in all five categories</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3 font-medium">Lifetime Warranty</td>
                      <td className="border border-gray-200 px-4 py-3">Warranty Score of 10 (verified lifetime coverage)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 font-medium">Crowd Favorite</td>
                      <td className="border border-gray-200 px-4 py-3">Social Consensus Score of 8.5 or higher</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3 font-medium">Repair Friendly</td>
                      <td className="border border-gray-200 px-4 py-3">Repairability Score of 8.5 or higher</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 font-medium">Eco Hero</td>
                      <td className="border border-gray-200 px-4 py-3">Sustainability Score of 8.0 or higher</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Data Sources */}
            <section className="mb-12">
              <h2 className="text-2xl font-serif font-bold text-brand-dark mb-4">
                Our Data Sources
              </h2>
              <p className="text-brand-gray mb-4">
                We aggregate data from multiple sources to ensure comprehensive, unbiased assessments:
              </p>
              <ul className="list-disc list-inside text-brand-gray space-y-2">
                <li><strong>Manufacturer specifications:</strong> Official product pages, spec sheets, warranty documents</li>
                <li><strong>E-commerce platforms:</strong> Amazon, specialty retailers with verified purchase reviews</li>
                <li><strong>Community forums:</strong> Reddit (r/BuyItForLife, category-specific subreddits), product enthusiast forums</li>
                <li><strong>Professional reviews:</strong> Consumer Reports, Wirecutter, category-specific publications</li>
                <li><strong>Repair resources:</strong> iFixit, manufacturer service bulletins, repair forum discussions</li>
                <li><strong>Sustainability databases:</strong> B Corp directory, environmental certification bodies</li>
              </ul>
            </section>

            {/* Methodology Updates */}
            <section className="mb-12">
              <h2 className="text-2xl font-serif font-bold text-brand-dark mb-4">
                Continuous Improvement
              </h2>
              <p className="text-brand-gray mb-4">
                Our scoring methodology evolves as we gather more data and receive community feedback.
                We regularly:
              </p>
              <ul className="list-disc list-inside text-brand-gray space-y-2">
                <li>Re-evaluate products when significant new information emerges</li>
                <li>Update scores based on long-term owner reports</li>
                <li>Adjust for manufacturer changes (materials, production location, ownership)</li>
                <li>Incorporate community corrections and suggestions</li>
              </ul>
              <p className="text-brand-gray mt-4">
                If you have information that could improve a product&apos;s score accuracy,
                <Link href="/how-it-works" className="text-brand-teal hover:underline ml-1">
                  submit feedback through our form
                </Link>.
              </p>
            </section>

            {/* CTA */}
            <section className="bg-gray-900 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-serif font-bold text-white mb-3">
                Ready to Find Products Built to Last?
              </h2>
              <p className="text-gray-300 mb-6">
                Browse our curated collection of BIFL-rated products across every category.
              </p>
              <Link
                href="/categories"
                className="inline-block bg-brand-teal text-white font-semibold py-3 px-8 rounded-lg hover:bg-brand-teal/80 transition-colors"
              >
                Browse All Categories
              </Link>
            </section>
          </div>
        </article>
      </div>
    </>
  )
}

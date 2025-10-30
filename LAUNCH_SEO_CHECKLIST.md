# Launch & SEO Checklist for Buy It For Life Products

## 🚀 PRE-LAUNCH CHECKLIST

### Critical Functionality

- [ ] **Slug-based URLs Working**
  - Test: Visit https://buyitforlifeproducts.com/products/[any-product-slug]
  - Verify: All product links use slugs, not UUIDs
  - Test: Old UUID URLs redirect to slug URLs (if applicable)

- [ ] **User Authentication**
  - Test sign-up flow completely
  - Test sign-in with email/password
  - Test password reset flow
  - Test user dashboard access
  - Verify avatar upload works
  - Test profile updates save correctly

- [ ] **Core User Features**
  - Test adding/removing favorites
  - Test recently viewed products tracking
  - Test product comparison (add/remove/compare)
  - Test review submission and display
  - Test review voting (helpful/not helpful)

- [ ] **Forms & Submissions**
  - Newsletter signup form works
  - Feedback form sends correctly
  - Review submission form validates properly
  - Contact forms work (if any)
  - Error messages display correctly

- [ ] **Product Pages**
  - All product detail pages load
  - Images display correctly
  - Scores and ratings show properly
  - Related products appear
  - Affiliate links work correctly
  - Reviews display correctly

- [ ] **Category & Navigation**
  - All category pages load
  - Filters work correctly
  - Search functionality works
  - Breadcrumbs display properly
  - Main navigation works on mobile

- [ ] **Mobile Responsiveness**
  - Test on iPhone (Safari)
  - Test on Android (Chrome)
  - Test tablet views
  - Test all breakpoints
  - Test hamburger menu
  - Test touch interactions

### Performance & Technical

- [ ] **Environment Variables**
  - All production env vars set in Vercel
  - BETTER_AUTH_SECRET set (not using default)
  - SUPABASE_SERVICE_ROLE_KEY set
  - DATABASE_URL configured
  - All API keys secured

- [ ] **Error Handling**
  - 404 pages work correctly
  - 500 errors handled gracefully
  - API errors show user-friendly messages
  - Network failures handled

- [ ] **Database**
  - Verify RLS policies are active
  - Test database backups work
  - Verify connection pooling
  - Check query performance on large datasets

- [ ] **Security**
  - HTTPS enforced everywhere
  - CSP headers configured
  - Rate limiting on APIs
  - SQL injection protection
  - XSS protection
  - CSRF protection

---

## 🔍 SEO CHECKLIST

### Technical SEO Foundation

- [ ] **Sitemap**
  - Generate XML sitemap at /sitemap.xml
  - Include all product pages
  - Include category pages
  - Include curations
  - Include static pages
  - Submit to Google Search Console
  - Submit to Bing Webmaster Tools

- [ ] **Robots.txt**
  ```
  Location: /public/robots.txt
  ```
  - Allow search engines to crawl
  - Disallow admin pages
  - Disallow API routes
  - Disallow user dashboard
  - Link to sitemap

- [ ] **Google Search Console**
  - Verify domain ownership
  - Submit sitemap
  - Check for crawl errors
  - Monitor index coverage
  - Set up URL inspection

- [ ] **Google Analytics 4**
  - Install GA4 tracking code
  - Set up events for:
    - Product views
    - Add to favorites
    - Review submissions
    - Outbound affiliate clicks
    - Newsletter signups
  - Test tracking works

### On-Page SEO

- [ ] **Meta Tags - Product Pages**
  ```typescript
  // Check: app/products/[slug]/page.tsx
  ```
  - Title: "{Product Name} Review - BIFL Score {score}/10 | Buy It For Life"
  - Description: Unique 150-160 chars with product USP
  - Include target keywords naturally
  - Add price in meta if available
  - Include brand name

- [ ] **Meta Tags - Category Pages**
  ```typescript
  // Check: app/categories/[slug]/page.tsx
  ```
  - Title: "Best {Category} Products - Buy It For Life Quality | BIFL"
  - Description: Overview of category with top products
  - Include "buy it for life" keyword

- [ ] **Meta Tags - Homepage**
  ```typescript
  // Check: app/page.tsx
  ```
  - Title: "Buy It For Life Products - Durable, Long-Lasting Product Reviews"
  - Description: Compelling value prop in 150-160 chars
  - Include main keywords

- [ ] **Structured Data (JSON-LD)**

  **Product Pages:**
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Product Name",
    "description": "Product description",
    "image": "product-image-url",
    "brand": {
      "@type": "Brand",
      "name": "Brand Name"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "8.5",
      "bestRating": "10",
      "worstRating": "0",
      "reviewCount": "15"
    },
    "offers": {
      "@type": "Offer",
      "price": "99.99",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "product-page-url"
    }
  }
  ```

  **Review Schema:**
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "9",
      "bestRating": "10"
    },
    "author": {
      "@type": "Person",
      "name": "Reviewer Name"
    },
    "reviewBody": "Review text..."
  }
  ```

  **Breadcrumb Schema:**
  ```json
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [...]
  }
  ```

- [ ] **Canonical URLs**
  ```typescript
  // Ensure each page has:
  <link rel="canonical" href="https://buyitforlifeproducts.com/products/{slug}" />
  ```
  - All product pages
  - All category pages
  - Homepage
  - No duplicate content issues

- [ ] **Open Graph Tags**
  ```html
  <meta property="og:title" content="Product Name - BIFL Review" />
  <meta property="og:description" content="..." />
  <meta property="og:image" content="high-quality-image-url" />
  <meta property="og:url" content="page-url" />
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="Buy It For Life Products" />
  ```

- [ ] **Twitter Cards**
  ```html
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Product Name" />
  <meta name="twitter:description" content="..." />
  <meta name="twitter:image" content="image-url" />
  ```

### Content SEO

- [ ] **Heading Structure**
  - Each page has ONE H1
  - H2s for main sections
  - H3s for subsections
  - Logical hierarchy
  - Include keywords in headings

- [ ] **Image Optimization**
  - All images have descriptive alt text
  - Alt text includes keywords when relevant
  - Images compressed (WebP format)
  - Lazy loading enabled
  - Critical images preloaded

- [ ] **Internal Linking**
  - Related products linked
  - Category pages link to products
  - Breadcrumbs on all pages
  - Footer links to important pages
  - Consistent anchor text

- [ ] **URL Structure**
  ✅ Already done with slug migration!
  - /products/product-name-here
  - /categories/category-name
  - /curations/curation-name
  - Short, descriptive, keyword-rich

### Performance SEO

- [ ] **Core Web Vitals**
  - **LCP (Largest Contentful Paint)** < 2.5s
    - Optimize hero images
    - Preload critical resources
  - **FID (First Input Delay)** < 100ms
    - Minimize JavaScript
    - Use code splitting
  - **CLS (Cumulative Layout Shift)** < 0.1
    - Set image dimensions
    - Avoid layout shifts

- [ ] **Page Speed**
  - Test with PageSpeed Insights
  - Target 90+ mobile score
  - Target 95+ desktop score
  - Fix any "Opportunities"
  - Implement "Diagnostics" suggestions

- [ ] **Mobile-First Optimization**
  - Mobile viewport configured
  - Touch targets sized properly (48x48px minimum)
  - Text readable without zoom
  - No horizontal scrolling
  - Fast mobile load time

### Redirects & Migration

- [ ] **301 Redirects from UUID to Slug**
  ```typescript
  // In middleware.ts or next.config.js
  // Redirect: /products/e14b7100-b282-4c02-ab49-12c6a2caaca4
  // To: /products/darn-tough-vermont-hiker-boot-sock
  ```
  - Set up redirect mapping
  - Test all old URLs redirect correctly
  - Check Google Search Console for 404s

### Advanced SEO

- [ ] **Hreflang Tags** (if multiple languages)
  ```html
  <link rel="alternate" hreflang="en" href="..." />
  ```

- [ ] **Pagination**
  - rel="next" and rel="prev" on paginated pages
  - Or implement "View All" option

- [ ] **FAQ Schema** (if you have FAQs)
  ```json
  {
    "@type": "FAQPage",
    "mainEntity": [...]
  }
  ```

- [ ] **Rich Snippets Testing**
  - Test with Google Rich Results Test
  - Verify Product snippets show
  - Verify Review snippets show
  - Check for errors/warnings

---

## 📊 ANALYTICS & MONITORING

- [ ] **Set Up Monitoring**
  - [ ] Google Search Console (search performance)
  - [ ] Google Analytics 4 (user behavior)
  - [ ] Vercel Analytics (performance)
  - [ ] Sentry or similar (error tracking)
  - [ ] Uptime monitoring (UptimeRobot/Pingdom)

- [ ] **Key Metrics to Track**
  - Organic search traffic
  - Click-through rate (CTR) from search
  - Average position in search results
  - Conversion rate (to affiliate clicks)
  - Bounce rate
  - Time on page
  - Pages per session

---

## 🎯 CONTENT STRATEGY (Post-Launch)

- [ ] **Blog/Content Hub**
  - Create buying guides for each category
  - "How to Choose" articles
  - "Best of" roundups
  - Maintenance guides
  - Comparison articles

- [ ] **Keyword Research**
  - Use Google Keyword Planner
  - Use Ahrefs/SEMrush
  - Target long-tail keywords
  - Focus on "buy it for life [product]" queries

- [ ] **Backlink Strategy**
  - Reach out to relevant blogs
  - Guest posting opportunities
  - Resource page outreach
  - HARO (Help a Reporter Out)

---

## ✅ FINAL PRE-LAUNCH CHECKS

- [ ] Spell check all content
- [ ] Test checkout/affiliate flows
- [ ] Verify email sending works
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Run Lighthouse audit on key pages
- [ ] Check all external links work
- [ ] Verify footer links
- [ ] Test social sharing
- [ ] Check GDPR compliance (if applicable)
- [ ] Review terms of service
- [ ] Update copyright year
- [ ] Create launch announcement
- [ ] Prepare social media posts

---

## 📈 POST-LAUNCH (First Week)

- [ ] Monitor error logs daily
- [ ] Check analytics daily
- [ ] Watch for 404 errors in Search Console
- [ ] Monitor page load times
- [ ] Track user feedback
- [ ] Fix any critical bugs immediately
- [ ] Respond to user reviews/feedback
- [ ] Share on social media
- [ ] Submit to product directories (Product Hunt, etc.)

---

## 🔧 QUICK WINS TO IMPLEMENT NOW

### 1. Add robots.txt
```
Location: /public/robots.txt

User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /user-dashboard
Disallow: /_next
Sitemap: https://buyitforlifeproducts.com/sitemap.xml
```

### 2. Verify metadata in product pages
```typescript
// Check: app/products/[slug]/page.tsx
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(slug)

  return {
    title: `${product.name} Review - BIFL Score ${product.bifl_total_score}/10`,
    description: product.excerpt || product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.excerpt,
      images: [product.featured_image_url],
      type: 'product',
    },
  }
}
```

### 3. Add structured data to product pages
- Already partially implemented, verify it's complete
- Add Review schema for user reviews
- Add AggregateRating schema

### 4. Set up Google Search Console NOW
- Verify ownership
- Submit sitemap immediately
- Start collecting data

### 5. Check current page speed
Run: `npx lighthouse https://buyitforlifeproducts.com --view`

---

## Priority Order

### Week 1 (Before Public Launch)
1. ✅ Fix slug-based URLs (DONE!)
2. Google Search Console setup
3. Sitemap generation
4. Robots.txt
5. Meta tags optimization
6. Security review
7. Mobile testing

### Week 2 (Launch Week)
1. Analytics setup
2. Structured data verification
3. Performance optimization
4. Error monitoring
5. Backup strategy

### Week 3+ (Post-Launch)
1. Content creation
2. Backlink building
3. Monitor & optimize
4. User feedback implementation

Let me know which items you want to tackle first!

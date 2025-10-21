# Production Launch Checklist - BIFL Website

Comprehensive checklist for launching the BIFL website on Vercel with a custom domain.

---

## 📋 Pre-Launch Checklist

### 1. Code & Build Quality

- [ ] **Run full build locally**
  ```bash
  npm run build
  ```
  - [ ] Build completes without errors
  - [ ] No TypeScript errors
  - [ ] No ESLint errors (or only acceptable warnings)

- [ ] **Check for console errors**
  - [ ] Run dev server and check browser console
  - [ ] Test all major pages (home, products, categories, product detail)
  - [ ] No unhandled errors or warnings

- [ ] **Code cleanup**
  - [ ] Remove all `console.log()` statements (except intentional logging)
  - [ ] Remove commented-out code blocks
  - [ ] Remove unused imports and variables
  - [ ] Remove debug code and test data

- [ ] **Dependencies audit**
  ```bash
  npm audit
  npm audit fix
  ```
  - [ ] No critical vulnerabilities
  - [ ] Update outdated packages if needed

---

## 🌐 Domain & DNS Configuration

### 2. Domain Setup

- [ ] **Purchase/prepare custom domain**
  - [ ] Domain registered (e.g., buyitforlife.com)
  - [ ] Domain DNS is accessible

- [ ] **Vercel domain configuration**
  - [ ] Go to Vercel project → Settings → Domains
  - [ ] Add custom domain
  - [ ] Add www subdomain (optional)
  - [ ] Configure DNS records as instructed by Vercel:
    - [ ] A record for root domain → Vercel's IP (76.76.21.21)
    - [ ] CNAME for www → cname.vercel-dns.com
  - [ ] Wait for DNS propagation (can take 24-48 hours)

- [ ] **SSL/TLS Certificate**
  - [ ] Vercel automatically provisions SSL certificate
  - [ ] Verify HTTPS is working after DNS propagation
  - [ ] Force HTTPS redirect enabled

---

## 🔐 Environment Variables & Secrets

### 3. Vercel Environment Variables

- [ ] **Add all required environment variables in Vercel dashboard**
  - Go to Project Settings → Environment Variables

  **Supabase:**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (production only - DO NOT expose to client)

  **App Configuration:**
  - [ ] `NEXT_PUBLIC_APP_URL` (set to production domain)
  - [ ] `NODE_ENV` (set to "production")

  **Analytics (if using):**
  - [ ] Google Analytics ID
  - [ ] Vercel Analytics (auto-enabled)

- [ ] **Environment variable scope**
  - [ ] Production environment variables set
  - [ ] Preview environment variables set (optional)
  - [ ] Development environment variables kept local only

- [ ] **Security check**
  - [ ] No API keys or secrets committed to Git
  - [ ] `.env.local` in `.gitignore`
  - [ ] No hardcoded credentials in code

---

## 🗄️ Database & Backend Services

### 4. Supabase Production Setup

- [ ] **Database readiness**
  - [ ] All migrations applied
  - [ ] All tables created and indexed
  - [ ] Row Level Security (RLS) policies configured
  - [ ] Foreign keys and constraints in place

- [ ] **Data verification**
  - [ ] All 327 products imported
  - [ ] All categories and subcategories present
  - [ ] All brands imported
  - [ ] All FAQs imported (327 products × 5 FAQs = 1,635 FAQs)
  - [ ] All product images URLs working
  - [ ] Test data removed (if any)

- [ ] **Database performance**
  - [ ] Indexes on frequently queried columns:
    - [ ] `products.slug`
    - [ ] `products.category_id`
    - [ ] `products.brand_id`
    - [ ] `products.status`
    - [ ] `categories.slug`
    - [ ] `brands.slug`
  - [ ] Check slow query logs
  - [ ] Optimize heavy queries if needed

- [ ] **Supabase settings**
  - [ ] Connection pooling enabled (if needed)
  - [ ] Appropriate database size for traffic
  - [ ] Backups configured
  - [ ] Point-in-time recovery enabled (recommended)

---

## ⚡ Performance Optimization

### 5. Next.js Optimization

- [ ] **Image optimization**
  - [ ] All images using Next.js `<Image>` component
  - [ ] Proper width/height attributes set
  - [ ] Lazy loading enabled
  - [ ] Images optimized and compressed
  - [ ] Consider using CDN for product images

- [ ] **Code splitting**
  - [ ] Dynamic imports for heavy components
  - [ ] Route-based code splitting working
  - [ ] Check bundle size: `npm run build` and review output

- [ ] **Caching strategy**
  - [ ] Static pages properly cached
  - [ ] API routes with appropriate cache headers
  - [ ] Revalidation intervals set for ISR pages
  - [ ] Consider implementing Redis cache for frequently accessed data

- [ ] **Font optimization**
  - [ ] Using `next/font` for Google Fonts
  - [ ] Font files preloaded
  - [ ] Font display: swap enabled

---

## 🔍 SEO & Metadata

### 6. SEO Configuration

- [ ] **Meta tags on all pages**
  - [ ] Title tags (unique for each page, under 60 characters)
  - [ ] Meta descriptions (unique, 150-160 characters)
  - [ ] Open Graph tags (og:title, og:description, og:image)
  - [ ] Twitter Card tags

- [ ] **Sitemap**
  - [ ] Generate sitemap.xml
  - [ ] Submit to Google Search Console
  - [ ] Submit to Bing Webmaster Tools

- [ ] **Robots.txt**
  - [ ] Create robots.txt file
  - [ ] Allow all pages (or specify restrictions)
  - [ ] Link to sitemap

- [ ] **Structured data (Schema.org)**
  - [ ] Product schema on product pages
  - [ ] Organization schema
  - [ ] Breadcrumb schema
  - [ ] Review/Rating schema

- [ ] **Canonical URLs**
  - [ ] Set canonical URLs to prevent duplicate content
  - [ ] Ensure www vs non-www consistency

- [ ] **404 page**
  - [ ] Custom 404 page created
  - [ ] Helpful navigation links
  - [ ] Search functionality

---

## 🔒 Security & Compliance

### 7. Security Checklist

- [ ] **HTTPS everywhere**
  - [ ] All requests redirect to HTTPS
  - [ ] No mixed content warnings
  - [ ] Secure cookies (if using authentication)

- [ ] **Content Security Policy (CSP)**
  - [ ] Configure CSP headers in `next.config.js`
  - [ ] Test CSP doesn't break functionality

- [ ] **API security**
  - [ ] Rate limiting on API routes (consider Vercel rate limiting)
  - [ ] Input validation on all forms
  - [ ] SQL injection prevention (parameterized queries)
  - [ ] XSS protection

- [ ] **Authentication & Authorization**
  - [ ] User authentication working (if applicable)
  - [ ] Admin routes protected
  - [ ] Role-based access control (if needed)

- [ ] **Privacy & Compliance**
  - [ ] Privacy Policy page created
  - [ ] Terms of Service page created
  - [ ] Cookie consent banner (if required)
  - [ ] GDPR compliance (if targeting EU)
  - [ ] Affiliate disclosure (you have affiliate links)

---

## 🧪 Testing

### 8. Cross-Browser & Device Testing

- [ ] **Desktop browsers**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)

- [ ] **Mobile browsers**
  - [ ] iOS Safari
  - [ ] Chrome Mobile
  - [ ] Samsung Internet

- [ ] **Responsive design**
  - [ ] Test on mobile (375px - iPhone SE)
  - [ ] Test on tablet (768px - iPad)
  - [ ] Test on desktop (1280px+)
  - [ ] Test on large desktop (1920px+)
  - [ ] Mobile navigation works
  - [ ] Mobile filter drawer works
  - [ ] All touch targets ≥ 44px

- [ ] **Core functionality testing**
  - [ ] Homepage loads correctly
  - [ ] Product listing page works
  - [ ] Product detail pages load
  - [ ] Category pages work
  - [ ] Search functionality works
  - [ ] Filtering works (desktop & mobile)
  - [ ] Sort functionality works
  - [ ] Pagination/"Load More" works
  - [ ] Compare feature works
  - [ ] Favorites/wishlist works (if implemented)

- [ ] **Performance testing**
  - [ ] Run Lighthouse audit (aim for 90+ scores)
  - [ ] Test on 3G connection
  - [ ] Check Time to First Byte (TTFB)
  - [ ] Check Largest Contentful Paint (LCP)
  - [ ] Check Cumulative Layout Shift (CLS)
  - [ ] Check First Input Delay (FID)

---

## 📊 Analytics & Monitoring

### 9. Analytics Setup

- [ ] **Google Analytics 4**
  - [ ] GA4 property created
  - [ ] Tracking code installed
  - [ ] Test events firing correctly
  - [ ] E-commerce tracking (if applicable)

- [ ] **Vercel Analytics**
  - [ ] Enable Vercel Web Analytics
  - [ ] Enable Vercel Speed Insights

- [ ] **Search Console**
  - [ ] Add property to Google Search Console
  - [ ] Verify ownership
  - [ ] Submit sitemap
  - [ ] Monitor index coverage

- [ ] **Error tracking**
  - [ ] Set up error monitoring (Sentry, LogRocket, etc.)
  - [ ] Test error reporting
  - [ ] Configure alerts for critical errors

- [ ] **Uptime monitoring**
  - [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
  - [ ] Configure downtime alerts

---

## 🚀 Deployment Configuration

### 10. Vercel Project Settings

- [ ] **Build settings**
  - [ ] Framework preset: Next.js
  - [ ] Build command: `npm run build` (or default)
  - [ ] Output directory: `.next` (default)
  - [ ] Install command: `npm install`
  - [ ] Node.js version: 18.x or 20.x

- [ ] **Git integration**
  - [ ] Connect to GitHub repository
  - [ ] Production branch: `main`
  - [ ] Auto-deploy on push: Enabled
  - [ ] Preview deployments: Enabled (optional)

- [ ] **Function configuration**
  - [ ] Serverless function region (choose closest to users)
  - [ ] Function timeout appropriate for heavy queries
  - [ ] Max function size appropriate

- [ ] **Edge configuration** (if using Edge Runtime)
  - [ ] Edge functions enabled where appropriate
  - [ ] Edge middleware configured

---

## 📝 Content & Legal

### 11. Content Review

- [ ] **Pages content review**
  - [ ] Homepage copy finalized
  - [ ] About page created
  - [ ] Contact page created (if needed)
  - [ ] FAQ page created (if needed)
  - [ ] All product descriptions verified

- [ ] **Legal pages**
  - [ ] Privacy Policy
  - [ ] Terms of Service
  - [ ] Cookie Policy (if using cookies)
  - [ ] Affiliate Disclosure (required for Amazon Associates)
  - [ ] Return/Refund Policy (if selling products)

- [ ] **Branding**
  - [ ] Logo finalized
  - [ ] Favicon created (all sizes)
  - [ ] Apple touch icon
  - [ ] Social media preview images

---

## 🔗 External Integrations

### 12. Third-Party Services

- [ ] **Amazon Associates**
  - [ ] Affiliate links working
  - [ ] Proper affiliate disclosure visible
  - [ ] Link tracking working

- [ ] **Email service** (if applicable)
  - [ ] Newsletter signup working
  - [ ] Welcome email configured
  - [ ] Email templates designed

- [ ] **Social media**
  - [ ] Social media accounts created
  - [ ] Social sharing buttons work
  - [ ] Open Graph images display correctly

---

## ✅ Final Pre-Launch Checks

### 13. Last-Minute Verification

- [ ] **Run full site audit**
  - [ ] Broken link checker (no 404s)
  - [ ] Image alt text on all images
  - [ ] All forms working and validated
  - [ ] All CTAs working

- [ ] **Mobile verification**
  - [ ] Search functionality in mobile menu works
  - [ ] Mobile filter drawer works
  - [ ] All gestures and interactions work
  - [ ] Text is readable without zooming

- [ ] **Performance final check**
  ```bash
  npm run build
  npm run start
  ```
  - [ ] Test production build locally
  - [ ] No console errors
  - [ ] Pages load quickly

- [ ] **Database backup**
  - [ ] Create full database backup before launch
  - [ ] Store backup securely
  - [ ] Document restoration process

---

## 🚀 Launch Day

### 14. Deployment Steps

1. [ ] **Final code push**
   ```bash
   git add .
   git commit -m "Production launch preparation"
   git push origin main
   ```

2. [ ] **Verify deployment on Vercel**
   - [ ] Check deployment logs for errors
   - [ ] Test on Vercel preview URL first

3. [ ] **Point domain to Vercel**
   - [ ] Update DNS records
   - [ ] Wait for propagation (use https://dnschecker.org)

4. [ ] **Verify production site**
   - [ ] Site loads on custom domain
   - [ ] HTTPS working
   - [ ] All functionality works on production domain
   - [ ] Check analytics tracking

5. [ ] **Announce launch**
   - [ ] Social media announcement
   - [ ] Email announcement (if applicable)
   - [ ] Submit to relevant directories

---

## 📈 Post-Launch (First 24-48 Hours)

### 15. Monitoring & Optimization

- [ ] **Monitor errors**
  - [ ] Check error logs hourly
  - [ ] Fix critical issues immediately
  - [ ] Monitor server response times

- [ ] **Monitor analytics**
  - [ ] Verify Google Analytics tracking
  - [ ] Check traffic sources
  - [ ] Monitor bounce rate

- [ ] **Performance monitoring**
  - [ ] Monitor Core Web Vitals
  - [ ] Check Vercel analytics dashboard
  - [ ] Monitor database query performance

- [ ] **User feedback**
  - [ ] Monitor social media mentions
  - [ ] Check for user-reported issues
  - [ ] Address urgent feedback

- [ ] **SEO monitoring**
  - [ ] Monitor Google Search Console for issues
  - [ ] Check index coverage
  - [ ] Verify sitemap is being crawled

---

## 🔄 Ongoing Maintenance

### 16. Post-Launch Tasks (Week 1-4)

- [ ] **Week 1**
  - [ ] Daily error log review
  - [ ] Daily analytics review
  - [ ] Performance optimization based on data
  - [ ] Fix any reported bugs

- [ ] **Week 2-4**
  - [ ] Weekly analytics review
  - [ ] Content updates based on user behavior
  - [ ] SEO optimization based on Search Console data
  - [ ] A/B testing (if applicable)

- [ ] **Monthly**
  - [ ] Security updates
  - [ ] Dependency updates
  - [ ] Backup verification
  - [ ] Performance audit

---

## 📋 Quick Reference Commands

```bash
# Build and test locally
npm run build
npm run start

# Run linting
npm run lint

# Security audit
npm audit
npm audit fix

# Test production environment variables
vercel env pull .env.production.local

# Deploy to Vercel (if not auto-deploying)
vercel --prod
```

---

## 🆘 Emergency Rollback Plan

**If something goes wrong after launch:**

1. **Immediate rollback on Vercel**
   - Go to Deployments tab
   - Find last working deployment
   - Click "Promote to Production"

2. **DNS rollback** (if needed)
   - Revert DNS records to previous configuration
   - Wait for propagation

3. **Database rollback** (if needed)
   - Restore from backup
   - Supabase: Use point-in-time recovery

4. **Communication**
   - Post status update on social media
   - Update users about temporary issues
   - Provide ETA for fix

---

## ✨ Success Metrics

**Track these metrics to measure launch success:**

- [ ] 95%+ uptime in first month
- [ ] Lighthouse score 90+ across all categories
- [ ] Core Web Vitals all in "Good" range
- [ ] Zero critical security vulnerabilities
- [ ] Error rate < 0.1%
- [ ] Average page load time < 2 seconds
- [ ] Mobile usability score: 100/100

---

## 📞 Support Contacts

**Keep these handy:**

- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.io
- **Domain Registrar Support**: [Your registrar]
- **Emergency Contact**: [Your phone/email]

---

**Last Updated**: 2025-10-21
**Version**: 1.0
**Status**: Ready for launch preparation

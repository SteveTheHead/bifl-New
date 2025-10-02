# Analytics & Tracking Overview

Your BIFL site comes with a comprehensive analytics setup to help you understand user behavior and optimize conversions.

## Integrated Tools

### 1. Google Analytics 4 (GA4)
**Purpose**: Quantitative data and event tracking

**What it tracks:**
- Page views and traffic sources
- User demographics and interests
- Custom events (product views, affiliate clicks, searches)
- Conversion funnels
- User acquisition and retention

**Setup Guide**: [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md)

### 2. Microsoft Clarity
**Purpose**: Qualitative UX insights

**What it provides:**
- Session recordings (watch real user sessions)
- Heatmaps (click, scroll, area)
- Rage clicks and dead clicks (frustration indicators)
- Scroll depth analysis

**Setup Guide**: [CLARITY_SETUP.md](./CLARITY_SETUP.md)

### 3. Vercel Analytics
**Purpose**: Core web vitals and performance

**What it tracks:**
- Page load performance
- Real User Monitoring (RUM)
- Audience insights

**Already integrated** (comes with Vercel deployment)

## Quick Setup

### Step 1: Google Analytics
```bash
# .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```
Get your measurement ID: https://analytics.google.com

### Step 2: Microsoft Clarity
```bash
# .env.local
NEXT_PUBLIC_CLARITY_PROJECT_ID=abc123xyz
```
Get your project ID: https://clarity.microsoft.com

### Step 3: Restart Server
```bash
npm run dev
```

That's it! Both tools will automatically start collecting data.

## What Each Tool Is Best For

| Task | Tool | Why |
|------|------|-----|
| Track total visitors | GA4 | Better traffic source breakdown |
| See affiliate click rates | GA4 | Event tracking with conversions |
| Understand why users don't click affiliate links | Clarity | Watch session recordings |
| Identify confusing UI | Clarity | Rage clicks, dead clicks |
| Track product searches | GA4 | Custom event with search terms |
| See which products get most attention | Clarity | Heatmaps on product grid |
| Measure page load speed | Vercel Analytics | Real user monitoring |
| A/B test results | GA4 | Event tracking by variant |
| Find broken/confusing navigation | Clarity | User path analysis |

## Key Metrics to Monitor

### Product Discovery
- **Most viewed products** (GA4)
- **Search terms** (GA4 custom event)
- **Filter usage** (GA4 custom event)
- **Category click-through rate** (GA4)

### Engagement
- **Average session duration** (GA4)
- **Pages per session** (GA4)
- **Scroll depth on product pages** (Clarity)
- **Compare feature usage** (GA4 custom event)

### Conversion Optimization
- **Product view → Affiliate click rate** (GA4)
- **Heatmaps showing affiliate link visibility** (Clarity)
- **Session recordings of high-value users** (Clarity)
- **Rage clicks near CTAs** (Clarity - indicates frustration)

### User Experience
- **Dead clicks** (Clarity - users clicking non-interactive elements)
- **Quick backs** (Clarity - users immediately leaving)
- **Error clicks** (Clarity - clicks that trigger errors)
- **Mobile vs. Desktop behavior** (Both)

## Recommended Dashboard Setup

### GA4 Dashboard
Create custom reports for:
1. **Affiliate Performance**: Product views → Affiliate clicks funnel
2. **Product Popularity**: Most viewed products by BIFL score range
3. **Search Analysis**: Top search terms and result clicks
4. **User Journey**: Typical navigation paths

### Clarity Dashboard
Create segments for:
1. **High-Intent Users**: 3+ page views, >2min session
2. **Bounced Users**: Single page view, <30sec
3. **Mobile Users**: To optimize mobile experience
4. **Affiliate Clickers**: Users who clicked affiliate links (to see what they did differently)

## Custom Events Available

You can track these events anywhere in your app:

```typescript
import {
  trackProductView,           // Auto-tracked on product pages
  trackAffiliateClick,         // Auto-tracked on affiliate links
  trackProductSearch,          // Track search terms
  trackProductCompare,         // Track product comparisons
  trackAddToFavorites,         // Track favorites
  trackRemoveFromFavorites,    // Track unfavorites
  trackFilterUsage,            // Track filter selections
  trackCategoryView,           // Track category browsing
  trackSignIn,                 // Track user sign-ins
  trackSignUp                  // Track new registrations
} from '@/lib/analytics'
```

## Privacy Considerations

Both tools collect user data. To be compliant:

### Required for GDPR/CCPA:
1. ✅ Add a Privacy Policy page
2. ✅ Consider a cookie consent banner
3. ✅ Explain what you track in privacy policy

### Built-in Privacy Features:
- Clarity automatically masks sensitive data (passwords, emails, credit cards)
- GA4 is more privacy-focused than old Universal Analytics
- Both tools allow IP anonymization

### Best Practice:
Add this to your site footer:
```html
By using this site, you agree to our use of cookies for analytics.
Learn more in our <a href="/privacy">Privacy Policy</a>.
```

## Costs

| Tool | Cost |
|------|------|
| Google Analytics 4 | Free (up to 10M events/month) |
| Microsoft Clarity | 100% Free, unlimited |
| Vercel Analytics | Free on Hobby plan, $10/mo on Pro |

## Resources

- [Google Analytics Setup](./ANALYTICS_SETUP.md)
- [Microsoft Clarity Setup](./CLARITY_SETUP.md)
- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Clarity Documentation](https://learn.microsoft.com/en-us/clarity/)
- [Vercel Analytics](https://vercel.com/docs/analytics)

## Need Help?

Common issues:

**Not seeing data in GA4?**
- Check environment variable is set
- Wait 24-48 hours for first data
- Check Real-time reports (instant)
- Disable ad blockers during testing

**Not seeing Clarity recordings?**
- Wait 2-3 minutes after browsing
- Check Real-time section
- Verify project ID is correct
- Try browsing on incognito mode

**Performance concerns?**
Both tools are designed to be lightweight and shouldn't impact site performance. They load asynchronously after page content.

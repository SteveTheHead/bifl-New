# Analytics Setup Guide

Your BIFL site has two analytics tools integrated:

1. **Google Analytics 4** - Event tracking, conversions, traffic analysis
2. **Microsoft Clarity** - Heatmaps, session recordings, UX insights

This guide covers Google Analytics 4 setup. For Microsoft Clarity (heatmaps/recordings), see [CLARITY_SETUP.md](./CLARITY_SETUP.md).

## Setup Instructions

### 1. Create a Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new GA4 property (or use an existing one)
3. Navigate to **Admin** → **Data Streams**
4. Click **Add stream** → **Web**
5. Enter your website URL and stream name
6. Copy your **Measurement ID** (format: G-XXXXXXXXXX)

### 2. Add Measurement ID to Environment Variables

Add your GA4 Measurement ID to your `.env.local` file:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID from step 1.

### 3. Restart Your Development Server

```bash
npm run dev
```

Google Analytics will now track all page views and custom events automatically.

## What's Being Tracked

The following events are automatically tracked:

### Core Events

- **Page Views**: Every page navigation
- **Product Views**: When users view a product detail page
- **Affiliate Link Clicks**: When users click Amazon affiliate links

### Additional Events (Available via utility functions)

You can track these events in your components by importing from `@/lib/analytics`:

```typescript
import {
  trackProductSearch,
  trackProductCompare,
  trackAddToFavorites,
  trackRemoveFromFavorites,
  trackFilterUsage,
  trackCategoryView,
  trackSignIn,
  trackSignUp
} from '@/lib/analytics'
```

#### Examples:

**Track Search:**
```typescript
trackProductSearch('cast iron skillet')
```

**Track Comparison:**
```typescript
trackProductCompare(['product-id-1', 'product-id-2', 'product-id-3'])
```

**Track Favorites:**
```typescript
trackAddToFavorites('product-id', 'Product Name')
trackRemoveFromFavorites('product-id', 'Product Name')
```

**Track Filter Usage:**
```typescript
trackFilterUsage('category', 'Kitchen')
trackFilterUsage('score_range', '9.0-10')
```

**Track Category Views:**
```typescript
trackCategoryView('Home & Kitchen')
```

## Viewing Your Data

1. Go to [Google Analytics](https://analytics.google.com)
2. Select your property
3. Navigate to **Reports** to see:
   - Real-time user activity
   - Page views and navigation
   - Custom events (product views, affiliate clicks, etc.)
   - User demographics and behavior

### Custom Reports

Create custom reports in GA4 to track:

- **Top Products**: Products with most views
- **Affiliate Conversion Funnel**: View → Compare → Click Affiliate Link
- **Search Performance**: Most searched terms
- **Popular Categories**: Most filtered/viewed categories
- **User Engagement**: Time on site, pages per session

## Privacy Considerations

- Google Analytics 4 uses cookies and may require a cookie consent banner in some jurisdictions (GDPR, CCPA)
- Consider adding a privacy policy page explaining your use of analytics
- GA4 is more privacy-focused than Universal Analytics but still collects user data

## Troubleshooting

### Analytics not working?

1. **Check environment variable**: Make sure `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in `.env.local`
2. **Restart dev server**: Environment variables require a server restart
3. **Check browser console**: Look for any errors related to gtag
4. **Ad blockers**: Disable ad blockers during testing as they often block GA
5. **Verify Measurement ID**: Double-check it starts with "G-" not "UA-"

### Testing in Development

Google Analytics works in development mode. You can verify it's working by:

1. Opening your browser's developer tools
2. Going to the **Network** tab
3. Looking for requests to `google-analytics.com` or `googletagmanager.com`
4. Or checking **Real-time** reports in Google Analytics

## Additional Resources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Next.js Analytics Guide](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)

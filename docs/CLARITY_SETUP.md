# Microsoft Clarity Setup Guide

Microsoft Clarity provides free, unlimited heatmaps and session recordings to help you understand how users interact with your BIFL site.

## What You'll Get

### Heatmaps
- **Click heatmaps**: See where users click most
- **Scroll heatmaps**: Understand how far users scroll on each page
- **Area heatmaps**: Identify which sections get the most attention

### Session Recordings
- Watch real user sessions
- See mouse movements, clicks, and scrolling
- Filter recordings by page, device, country, etc.

### Insights Dashboard
- **Dead clicks**: Users clicking non-interactive elements
- **Rage clicks**: Frustrated repeated clicking (UX issues)
- **Excessive scrolling**: Users struggling to find content
- **Quick backs**: Users immediately leaving a page

## Setup Instructions

### 1. Create a Microsoft Clarity Account

1. Go to [Microsoft Clarity](https://clarity.microsoft.com)
2. Sign in with your Microsoft account (or create one - it's free)
3. Click **Add new project**
4. Enter your project details:
   - **Name**: BIFL
   - **Website URL**: Your site URL (e.g., `https://bifl.com`)
5. Click **Add project**

### 2. Get Your Project ID

After creating the project:
1. You'll see a setup page with installation instructions
2. Your **Project ID** is displayed at the top (a random string like `abc123xyz`)
3. Copy this Project ID

### 3. Add Project ID to Environment Variables

Add your Clarity Project ID to your `.env.local` file:

```bash
NEXT_PUBLIC_CLARITY_PROJECT_ID=abc123xyz
```

Replace `abc123xyz` with your actual Project ID from step 2.

### 4. Restart Your Development Server

```bash
npm run dev
```

Microsoft Clarity will now start collecting data automatically.

## How to Use Clarity

### View Heatmaps

1. Go to [clarity.microsoft.com](https://clarity.microsoft.com)
2. Select your BIFL project
3. Click **Heatmaps** in the left sidebar
4. Enter a URL (e.g., `/products` or a specific product page)
5. View click, scroll, and area heatmaps

**Use heatmaps to:**
- See if users find your CTAs (affiliate links, compare buttons)
- Understand how far users scroll on product pages
- Identify "dead zones" that users ignore
- Optimize your product grid layout

### Watch Session Recordings

1. Click **Recordings** in the left sidebar
2. Filter by:
   - Page URL (watch sessions on specific products)
   - Device type (mobile, desktop, tablet)
   - Country
   - Session duration
   - Errors or rage clicks
3. Click any recording to watch

**Use recordings to:**
- See how users navigate your site
- Identify confusing UI elements
- Watch the product comparison flow
- Understand why users leave without clicking affiliate links

### Check Insights Dashboard

1. Click **Dashboard** in the left sidebar
2. View key metrics:
   - **Sessions**: Total user sessions
   - **Pages per session**: Engagement level
   - **Rage clicks**: Frustration indicators
   - **Dead clicks**: UI confusion
   - **Excessive scrolling**: Navigation issues

### Popular Pages Report

1. Click **Pages** in the left sidebar
2. See your most visited pages
3. Click any page to see:
   - Session recordings for that page
   - Heatmaps
   - Scroll depth
   - Average time on page

## Privacy & Compliance

### GDPR Compliance

Microsoft Clarity is GDPR compliant, but you should:
1. Add Clarity to your privacy policy
2. Consider adding a cookie consent banner
3. Clarity automatically masks sensitive data (passwords, emails, credit cards)

### Data Masking

Clarity automatically masks:
- Password fields
- Credit card numbers
- Email addresses (in forms)
- Phone numbers

You can configure additional masking if needed.

## Best Practices

### What to Watch For

**Product Pages:**
- Are users scrolling to see BIFL scores?
- Do they click on score breakdowns?
- Are they clicking affiliate links?
- Do they use the compare feature?

**Product Grid/Filters:**
- Which filters are most used?
- Do users struggle to find products?
- Are they using search vs. browsing?

**Navigation:**
- Can users easily navigate between categories?
- Are they getting lost?
- Do they use the main nav or search?

### Key Metrics to Track

1. **Affiliate Click Rate**: % of product page views that result in affiliate clicks
2. **Compare Feature Usage**: How many products viewed → added to compare
3. **Filter Abandonment**: Users who start filtering but don't proceed
4. **Product Page Engagement**: Time on page, scroll depth, clicks

## Combining with Google Analytics

Use **Clarity + GA4** together:

- **GA4**: High-level metrics (traffic sources, conversions, events)
- **Clarity**: Behavioral insights (why users behave a certain way)

**Example workflow:**
1. GA4 shows low conversion on a product page
2. Clarity shows users aren't scrolling far enough to see the affiliate link
3. Fix: Move the affiliate link higher on the page
4. Verify improvement in both tools

## Troubleshooting

### Not seeing data?

1. **Check environment variable**: `NEXT_PUBLIC_CLARITY_PROJECT_ID` in `.env.local`
2. **Restart dev server**: Environment variables require restart
3. **Wait 2-3 minutes**: Clarity takes a few minutes to start showing data
4. **Check browser console**: Look for errors
5. **Ad blockers**: Disable during testing (they often block Clarity)
6. **Verify Project ID**: Check you copied the correct ID from Clarity dashboard

### Testing in Development

Clarity works in development mode. To test:
1. Browse your site normally
2. Wait 2-3 minutes
3. Check Clarity dashboard for real-time sessions
4. You should see your session appear

### Mobile Testing

To test mobile heatmaps/recordings:
1. Open your site on a mobile device (or use Chrome DevTools device emulation)
2. Navigate around
3. Check Clarity dashboard and filter by "Mobile" device type

## Resources

- [Microsoft Clarity Website](https://clarity.microsoft.com)
- [Clarity Documentation](https://learn.microsoft.com/en-us/clarity/)
- [Clarity Blog](https://clarity.microsoft.com/blog)
- [Clarity Academy (Video Tutorials)](https://clarity.microsoft.com/academy)

## Cost

Microsoft Clarity is **completely free** with:
- ✅ Unlimited sessions
- ✅ Unlimited websites
- ✅ Unlimited team members
- ✅ No credit card required
- ✅ No data limits
- ✅ No paid tiers

There are literally no costs or limits. Microsoft provides this free to compete with Hotjar and improve their understanding of web behavior.

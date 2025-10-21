# Vercel Environment Variables Setup Guide

This guide lists all environment variables that need to be configured in Vercel for production deployment.

## How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Click "Settings" > "Environment Variables"
4. Add each variable listed below
5. Set the appropriate environment (Production, Preview, Development)

---

## Required Variables

These variables MUST be set for the application to function:

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```
**Where to get:** Supabase Dashboard > Project Settings > API

### Application URL
```
NEXT_PUBLIC_APP_URL=https://buyitforlife.com
```
**Note:** Use your production domain URL

---

## Optional Variables

### Analytics & Monitoring

#### Google Analytics 4
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```
**Where to get:** https://analytics.google.com

#### Microsoft Clarity
```
NEXT_PUBLIC_CLARITY_PROJECT_ID=your-clarity-project-id
```
**Where to get:** https://clarity.microsoft.com

#### PostHog (if used)
```
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Authentication (Better Auth)

```
BETTER_AUTH_SECRET=<generate-a-random-32-char-string>
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```
**Generate secret:** `openssl rand -base64 32`

### Polar Integration (for subscriptions)
```
POLAR_ACCESS_TOKEN=your-polar-access-token
POLAR_WEBHOOK_SECRET=your-polar-webhook-secret
POLAR_SUCCESS_URL=dashboard
NEXT_PUBLIC_STARTER_TIER=tier-id
NEXT_PUBLIC_STARTER_SLUG=tier-slug
```

### AI Features (OpenAI/Anthropic)
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### Cloudflare R2 (Image Upload)
```
CLOUDFLARE_ACCOUNT_ID=your-account-id
R2_UPLOAD_IMAGE_ACCESS_KEY_ID=your-r2-access-key
R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY=your-r2-secret-key
R2_UPLOAD_IMAGE_BUCKET_NAME=your-bucket-name
```

---

## Environment Variable Checklist

### Minimum Required (Production)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`

### Recommended for Analytics
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- [ ] `NEXT_PUBLIC_CLARITY_PROJECT_ID`

### Optional Features
- [ ] `BETTER_AUTH_SECRET` (for user authentication)
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (for Google sign-in)
- [ ] `OPENAI_API_KEY` (for AI features)
- [ ] `POLAR_ACCESS_TOKEN` (for subscriptions)

---

## Verification Steps

After adding environment variables:

1. **Trigger a new deployment** in Vercel
2. **Check build logs** for any missing environment variable errors
3. **Test the production site:**
   - Database connection works
   - Analytics tracking is active
   - User authentication works (if enabled)
4. **Verify metadata** using:
   - https://www.opengraph.xyz/
   - Twitter Card Validator
   - Facebook Sharing Debugger

---

## Security Notes

- **Never commit** `.env` or `.env.local` files to Git
- Use **different values** for development and production
- Rotate secrets regularly, especially:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `BETTER_AUTH_SECRET`
  - API keys
- Enable **Vercel's Secure Compute** for sensitive variables

---

## Troubleshooting

### Build fails with "Cannot find module..."
- Verify all REQUIRED variables are set
- Check for typos in variable names

### Database connection errors
- Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active

### OG images not loading
- Verify `NEXT_PUBLIC_APP_URL` matches your production domain
- Clear social media caches (Facebook, Twitter, LinkedIn)

---

## Related Documentation

- [Vercel Environment Variables Docs](https://vercel.com/docs/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabase Setup Guide](https://supabase.com/docs/guides/getting-started)

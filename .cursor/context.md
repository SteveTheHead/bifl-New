# BIFL Product Directory - Project Context

## Overview
This is a Buy It For Life (BIFL) Product Directory that helps users find durable, long-lasting products. Built with modern AI-accelerated development practices using the 20x speed methodology.

## Tech Stack
- **Frontend**: Next.js 15 (App Router) + TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL with real-time features)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Authentication**: Supabase Auth
- **Development**: AI-accelerated with Cursor + Claude 3.5 Sonnet

## Architecture Philosophy
- **Read-only product data**: Scoring and badge logic from Google Sheets → Supabase
- **Interactive features**: User authentication, reviews, memberships
- **Component-driven**: Reusable UI patterns with proper TypeScript types
- **Server-first**: Use Server Components for data fetching, Client Components for interactivity

## Key Features
1. **Product Discovery**: Advanced filtering, search, taxonomy navigation
2. **BIFL Scoring System**: Visual display of durability, repairability, warranty, sustainability, social scores
3. **User System**: Authentication, profiles, membership levels (free/premium)
4. **Review Platform**: User reviews with verification and moderation
5. **Vendor Integration**: Affiliate links with proper disclosure

## Database Schema Overview
- **Products**: Core product data with BIFL scores and metadata
- **Taxonomies**: Brands, categories, materials, price ranges, tags, certifications
- **Reviews**: User-generated content with moderation system
- **Profiles**: User accounts extending Supabase Auth
- **Vendors**: Affiliate link management

## Development Approach
- **AI-first**: Use Claude for complex components and database queries
- **Iteration cycles**: 4-hour feature development instead of 4-week cycles
- **Component library**: Build reusable patterns for BIFL-specific needs
- **TypeScript everywhere**: Proper typing for better AI assistance and maintainability

## File Structure
```
app/
├── (auth)/                 # Authentication pages
├── products/               # Product listing and detail pages
├── profile/                # User profile and settings
├── api/                   # API routes for Supabase integration
components/
├── ui/                    # shadcn/ui base components
├── bifl/                  # BIFL-specific components (scoring, reviews)
├── forms/                 # Form components with validation
lib/
├── supabase/              # Database client and utilities
├── types/                 # TypeScript definitions
└── utils/                 # Helper functions
```

## Performance & Accessibility
- Mobile-first responsive design
- Proper semantic HTML and ARIA labels
- Loading states and error boundaries
- SEO optimization for product pages
- Progressive enhancement approach
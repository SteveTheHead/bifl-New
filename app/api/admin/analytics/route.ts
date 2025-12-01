import { NextResponse } from 'next/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

// Initialize the Analytics Data API client
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA4_CLIENT_EMAIL,
    private_key: process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
})

const propertyId = process.env.GA4_PROPERTY_ID

export async function GET() {
  if (!propertyId || !process.env.GA4_CLIENT_EMAIL || !process.env.GA4_PRIVATE_KEY) {
    return NextResponse.json(
      { error: 'GA4 credentials not configured' },
      { status: 500 }
    )
  }

  try {
    // Fetch multiple reports in parallel
    const [overviewReport, topPagesReport, eventsReport, trafficSourcesReport] = await Promise.all([
      // Overview metrics (last 30 days)
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          { startDate: '30daysAgo', endDate: 'today' },
          { startDate: '60daysAgo', endDate: '31daysAgo' }, // Previous period for comparison
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
        ],
      }),

      // Top pages (last 7 days)
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'activeUsers' },
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),

      // Event counts (last 7 days)
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        limit: 15,
      }),

      // Traffic sources (last 7 days)
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionSource' }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
    ])

    // Process overview data
    const currentPeriod = overviewReport[0]?.rows?.[0]?.metricValues || []
    const previousPeriod = overviewReport[0]?.rows?.[1]?.metricValues || []

    const overview = {
      activeUsers: parseInt(currentPeriod[0]?.value || '0'),
      activeUsersPrev: parseInt(previousPeriod[0]?.value || '0'),
      sessions: parseInt(currentPeriod[1]?.value || '0'),
      sessionsPrev: parseInt(previousPeriod[1]?.value || '0'),
      pageViews: parseInt(currentPeriod[2]?.value || '0'),
      pageViewsPrev: parseInt(previousPeriod[2]?.value || '0'),
      avgSessionDuration: parseFloat(currentPeriod[3]?.value || '0'),
      bounceRate: parseFloat(currentPeriod[4]?.value || '0') * 100,
    }

    // Process top pages
    const topPages = (topPagesReport[0]?.rows || []).map((row) => ({
      path: row.dimensionValues?.[0]?.value || '',
      pageViews: parseInt(row.metricValues?.[0]?.value || '0'),
      users: parseInt(row.metricValues?.[1]?.value || '0'),
    }))

    // Process events
    const events = (eventsReport[0]?.rows || []).map((row) => ({
      name: row.dimensionValues?.[0]?.value || '',
      count: parseInt(row.metricValues?.[0]?.value || '0'),
    }))

    // Process traffic sources
    const trafficSources = (trafficSourcesReport[0]?.rows || []).map((row) => ({
      source: row.dimensionValues?.[0]?.value || '(direct)',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      users: parseInt(row.metricValues?.[1]?.value || '0'),
    }))

    return NextResponse.json({
      overview,
      topPages,
      events,
      trafficSources,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('GA4 API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: String(error) },
      { status: 500 }
    )
  }
}

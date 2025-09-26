import { getCategories, getBrands, getPriceRanges } from '@/lib/supabase/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function TestDatabasePage() {
  try {
    const [categories, brands, priceRanges] = await Promise.all([
      getCategories(),
      getBrands(),
      getPriceRanges()
    ])

    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Database Connection Test</h1>
          <p className="text-muted-foreground mt-2">
            Testing Supabase connection and data retrieval
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Categories
                <Badge variant="secondary">{categories?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories?.slice(0, 5).map((category) => (
                  <div key={category.id} className="flex justify-between">
                    <span>{category.name}</span>
                    <span className="text-sm text-muted-foreground">
                      /{category.slug}
                    </span>
                  </div>
                ))}
                {categories && categories.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    ...and {categories.length - 5} more
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Brands
                <Badge variant="secondary">{brands?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {brands?.slice(0, 5).map((brand) => (
                  <div key={brand.id} className="flex justify-between">
                    <span>{brand.name}</span>
                    <span className="text-sm text-muted-foreground">
                      /{brand.slug}
                    </span>
                  </div>
                ))}
                {brands && brands.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    ...and {brands.length - 5} more
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Price Ranges
                <Badge variant="secondary">{priceRanges?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {priceRanges?.map((range) => (
                  <div key={range.id} className="space-y-1">
                    <div className="font-medium">{range.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {range.min_price && range.max_price
                        ? `$${range.min_price} - $${range.max_price}`
                        : range.min_price
                        ? `From $${range.min_price}`
                        : range.max_price
                        ? `Up to $${range.max_price}`
                        : 'Any price'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <span>Successfully connected to Supabase!</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              All database queries executed successfully. Your BIFL database is ready to go.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Connection Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Unable to connect to Supabase database. Please check your configuration.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <code className="text-sm">
                {error instanceof Error ? error.message : 'Unknown error'}
              </code>
            </div>
            <div className="mt-4 text-sm">
              <p className="font-medium">Setup steps:</p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Create a Supabase project</li>
                <li>Run your database schema SQL</li>
                <li>Copy .env.example to .env.local</li>
                <li>Add your Supabase URL and anon key</li>
                <li>Restart your development server</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
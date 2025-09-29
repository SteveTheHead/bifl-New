import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function TestImportPage() {
  const supabase = await createClient()

  try {
    // Get imported brands
    const { data: brands } = await supabase
      .from('brands')
      .select('*')
      .order('created_at', { ascending: false })

    // Get any imported products
    const { data: products } = await supabase
      .from('products')
      .select(`
        *,
        brands!brand_id(name, slug)
      `)
      .limit(10)

    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Import Test Results</h1>
          <p className="text-muted-foreground mt-2">
            Checking what data was successfully imported from CSV
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Imported Brands
                <Badge variant="secondary">{brands?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {brands?.map((brand: any) => (
                  <div key={brand.id} className="flex justify-between">
                    <span>{brand.name}</span>
                    <span className="text-sm text-muted-foreground">
                      /{brand.slug}
                    </span>
                  </div>
                ))}
                {(!brands || brands.length === 0) && (
                  <p className="text-sm text-muted-foreground">No brands imported</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Imported Products
                <Badge variant="secondary">{products?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products?.map((product: any) => (
                  <div key={product.id} className="space-y-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Brand: {product.brands?.name || 'Unknown'}
                    </div>
                    {product.bifl_total_score && (
                      <div className="text-sm">
                        BIFL Score: {product.bifl_total_score}/10
                      </div>
                    )}
                  </div>
                ))}
                {(!products || products.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No products imported yet - check schema issues
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>🔧 <strong>Fix schema:</strong> Run the SQL script to change score columns from INTEGER to DECIMAL</p>
              <p>📊 <strong>Re-import:</strong> Run the import script again after schema fix</p>
              <p>🚀 <strong>Build UI:</strong> Start building the product discovery interface</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Import Test Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-sm">
              {error instanceof Error ? error.message : 'Unknown error'}
            </code>
          </CardContent>
        </Card>
      </div>
    )
  }
}
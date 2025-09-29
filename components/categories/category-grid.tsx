import Link from 'next/link'
import Image from 'next/image'
import { Star, Package, TrendingUp } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon_url: string | null
  is_featured: boolean
  productCount: number
}

interface CategoryGridProps {
  categories: Category[]
  featured?: boolean
}

export function CategoryGrid({ categories, featured = false }: CategoryGridProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-brand-gray text-lg">
          No categories available at the moment.
        </p>
      </div>
    )
  }

  return (
    <div className={`grid gap-6 ${
      featured
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }`}>
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          featured={featured}
        />
      ))}
    </div>
  )
}

function CategoryCard({ category, featured }: { category: Category; featured?: boolean }) {
  const cardClasses = featured
    ? 'group relative bg-white rounded-lg border border-gray-200 p-6 hover:border-brand-teal hover:shadow-md transition-all duration-200'
    : 'group bg-white rounded-lg border border-gray-200 p-6 hover:border-brand-teal hover:shadow-md transition-all duration-200'

  // Safety check for category slug
  if (!category.slug) {
    return null
  }

  return (
    <Link href={`/categories/${category.slug}`} className={cardClasses}>
      {featured && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-brand-teal text-white text-xs px-2 py-1 rounded-full flex items-center">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Featured
          </div>
        </div>
      )}

      <div className="flex flex-col h-full">
        {/* Icon */}
        <div className="mb-4">
          {category.icon_url ? (
            <div className="relative w-12 h-12">
              <Image
                src={category.icon_url}
                alt={`${category.name} icon`}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-brand-teal" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-brand-dark mb-2 group-hover:text-brand-teal transition-colors">
            {category.name}
          </h3>

          {category.description && (
            <p className="text-sm text-brand-gray mb-4 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-brand-gray">
            <Package className="w-4 h-4 mr-1" />
            {category.productCount} products
          </div>

          <div className="flex items-center text-brand-teal">
            <span className="text-sm font-medium mr-1">Explore</span>
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
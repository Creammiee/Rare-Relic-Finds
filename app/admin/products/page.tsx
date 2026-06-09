import { supabase } from '@/lib/supabase'

export default async function ProductsPage() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-8">Error loading products</div>
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products?.map(product => (
          <div
            key={product.id}
            className="border rounded p-4"
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover mb-3"
            />

            <h2 className="font-semibold text-lg">
              {product.name}
            </h2>

            <p className="text-gray-600">
              ₱{product.price}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}

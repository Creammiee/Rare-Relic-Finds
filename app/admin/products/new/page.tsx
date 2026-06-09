'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const imageFile = (form.image as HTMLInputElement).files?.[0]

    if (!imageFile) {
      alert('Please select an image')
      setLoading(false)
      return
    }

    // 1️⃣ Upload image to Supabase Storage
    const fileName = `${Date.now()}-${imageFile.name}`

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, imageFile)

    if (uploadError) {
      alert(uploadError.message)
      setLoading(false)
      return
    }

    // 2️⃣ Get public image URL
    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(fileName)

    // 3️⃣ Insert product into database
    const { error: dbError } = await supabase.from('products').insert({
      name: form.productName.value,
      slug: form.slug.value,
      price: form.price.value,
      stock: form.stock.value,
      image_url: data.publicUrl
    })

    if (dbError) {
      alert(dbError.message)
    } else {
      router.push('/products')
    }

    setLoading(false)
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="productName"
          placeholder="Product Name"
          required
          className="w-full border p-2"
        />

        <input
          name="slug"
          placeholder="Slug (unique)"
          required
          className="w-full border p-2"
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          required
          className="w-full border p-2"
        />

        <input
          name="stock"
          type="number"
          placeholder="Stock"
          required
          className="w-full border p-2"
        />

        <input
          name="image"
          type="file"
          accept="image/*"
          required
        />

        <button
          disabled={loading}
          className="w-full bg-black text-white py-2"
        >
          {loading ? 'Uploading…' : 'Create Product'}
        </button>
      </form>
    </main>
  )
}

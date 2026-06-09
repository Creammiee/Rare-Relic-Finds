export type UserRole = 'admin' | 'seller' | 'user'
export type ProductStatus = 'pending' | 'approved' | 'rejected' | 'draft'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type ProductCondition = 'mint' | 'near_mint' | 'excellent' | 'good' | 'fair' | 'poor'
export type NotificationType = 'order' | 'product' | 'review' | 'system' | 'seller' | 'payment'
export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Seller {
  id: string
  user_id: string
  store_name: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  status: SellerStatus
  commission_rate: number
  total_sales: number
  rating: number
  review_count: number
  verified: boolean
  documents: string[] | null
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  product_count?: number
  created_at: string
}

export interface Product {
  id: string
  seller_id: string
  category_id: string
  title: string
  description: string
  price: number
  original_price: number | null
  condition: ProductCondition
  rarity_score: number
  authentication_status: 'authenticated' | 'unverified' | 'pending'
  estimated_market_value: number | null
  stock: number
  images: string[]
  tags: string[] | null
  status: ProductStatus
  is_featured: boolean
  view_count: number
  created_at: string
  updated_at: string
  seller?: Seller
  category?: Category
  reviews?: Review[]
  avg_rating?: number
}

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  subtotal: number
  shipping_cost: number
  total: number
  shipping_address: ShippingAddress
  payment_intent_id: string | null
  payment_method: string | null
  notes: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
  profile?: Profile
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  seller_id: string
  quantity: number
  price: number
  created_at: string
  product?: Product
}

export interface ShippingAddress {
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  product?: Product
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}

export interface Review {
  id: string
  user_id: string
  product_id: string
  seller_id: string
  rating: number
  comment: string | null
  images: string[] | null
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  link: string | null
  created_at: string
}

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  status: TicketStatus
  priority: 'low' | 'medium' | 'high'
  messages: TicketMessage[]
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface TicketMessage {
  id: string
  sender_id: string
  message: string
  is_admin: boolean
  created_at: string
}

export interface Banner {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  link: string | null
  active: boolean
  order_index: number
  created_at: string
}

export interface ActivityLog {
  id: string
  admin_id: string
  action: string
  details: Record<string, unknown>
  ip_address: string | null
  created_at: string
  profile?: Profile
}

export interface SavedAddress {
  id: string
  user_id: string
  label: string
  address: ShippingAddress
  is_default: boolean
  created_at: string
}

export interface Analytics {
  total_revenue: number
  total_orders: number
  total_products: number
  total_users: number
  revenue_trend: { date: string; revenue: number }[]
  top_categories: { name: string; count: number }[]
  recent_orders: Order[]
}

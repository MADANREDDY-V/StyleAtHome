export interface User {
  id: number;
  name: string;
  email?: string;
  mobile: string;
  gender?: string;
  role: 'USER' | 'ADMIN';
  created_at: string;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  section: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  mrp?: number;
  description?: string;
  image_url?: string;
  category_id: number;
  store_id: number;
  section?: string;
  color?: string;
  sizes?: string;
  rating?: number;
  review_count: number;
  is_new_arrival: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  size?: string;
  color?: string;
  product?: Product;
}

export interface TrialCartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  size?: string;
  color?: string;
  product?: Product;
}

export interface Slot {
  id: number;
  slot_date: string;
  time_slot: string;
  max_bookings: number;
  current_bookings: number;
}

export interface Booking {
  id: number;
  booking_number: string;
  user_id: number;
  session_type?: string;
  category?: string;
  booking_date?: string;
  time_slot?: string;
  address?: string;
  fee?: number;
  payment_method?: string;
  status: 'Pending' | 'Approved' | 'Assigned' | 'Out For Trial' | 'Trial Completed' | 'Purchased' | 'Returned';
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  total_amount: number;
  payment_method?: string;
  status: string;
  delivery_name?: string;
  delivery_mobile?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_pincode?: string;
  created_at: string;
}

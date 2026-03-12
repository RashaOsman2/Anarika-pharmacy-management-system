export type UserRole = 'shop1' | 'shop2' | 'owner' | 'admin';

export type UnitType = 'strip' | 'bottle' | 'box' | 'injection';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  shop_name: string | null;
  created_at: string;
}

export interface Shop {
  id: string;
  name: string;
  created_at: string;
}

export interface StockItem {
  id: string;
  shop_id: string;
  medicine_name: string;
  quantity: number;
  price: number;
  unit_type: UnitType;
  pieces_per_unit: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  shop_id: string;
  user_id: string | null;
  medicine_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  receipt_number: string;
  created_at: string;
  discount_percent?: number;
  discount_amount?: number;
  original_price?: number;
  sold_as?: 'strip' | 'piece' | 'unit';
}

export interface CartItem {
  medicine_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_percent?: number;
  discount_amount?: number;
  original_price?: number;
  sold_as?: 'strip' | 'piece' | 'unit';
  pieces_per_unit?: number;
  unit_type?: UnitType;
}

export interface Receipt {
  receipt_number: string;
  shop_name: string;
  items: CartItem[];
  total: number;
  date: string;
  subtotal?: number;
  total_discount?: number;
  customer_name?: string;
  customer_phone?: string;
}

export interface RestockHistory {
  id: string;
  shop_id: string;
  stock_id: string;
  medicine_name: string;
  quantity_added: number;
  previous_quantity: number;
  new_quantity: number;
  user_id: string | null;
  created_at: string;
  restock_type?: 'strip' | 'piece' | 'unit';
}

export type StockRemovalType = 'empty' | 'reduce' | 'remove' | 'sale';

export interface StockRemovalHistory {
  id: string;
  shop_id: string;
  stock_id: string | null;
  medicine_name: string;
  quantity_removed: number;
  previous_quantity: number;
  new_quantity: number;
  removal_type: StockRemovalType;
  user_id: string | null;
  created_at: string;
}

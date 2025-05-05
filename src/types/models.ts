
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'user' | 'admin';
  addresses: Address[];
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  isActive: boolean;
}

export enum CupSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

export interface JuiceVariant {
  size: CupSize;
  price: number;
  isAvailable: boolean;
}

export interface JuiceItem {
  id: string;
  name: string;
  description: string;
  image: string;
  categoryId: string;
  variants: JuiceVariant[];
  isAvailable: boolean;
  isFeatured: boolean;
}

export enum OrderStatus {
  PLACED = 'placed',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum OrderType {
  DELIVERY = 'delivery',
  TAKEAWAY = 'takeaway',
  DINE_IN = 'dine_in'
}

export interface CartItem {
  juiceId: string;
  juiceName: string;
  image: string;
  size: CupSize;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  type: OrderType;
  addressId?: string;
  tableNo?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  orderType: OrderType;
  status: OrderStatus;
  paymentId?: string;
  address?: Address;
  tableNo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalEarnings: number;
  pendingOrders: number;
  completedOrders: number;
}

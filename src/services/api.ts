
import { 
  Category, 
  JuiceItem, 
  Order, 
  OrderStatus, 
  OrderType,
  Cart,
  Address,
  DashboardStats
} from '@/types/models';
import { categories, juices, mockOrders, dashboardStats } from './mockData';
import { toast } from 'sonner';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Categories API
export const getCategories = async (): Promise<Category[]> => {
  await delay(500);
  return categories;
};

export const getCategoryById = async (id: string): Promise<Category | undefined> => {
  await delay(300);
  return categories.find(category => category.id === id);
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  await delay(800);
  const newCategory = {
    ...category,
    id: `cat-${Date.now()}`
  };
  categories.push(newCategory);
  return newCategory;
};

export const updateCategory = async (category: Category): Promise<Category> => {
  await delay(800);
  const index = categories.findIndex(c => c.id === category.id);
  if (index !== -1) {
    categories[index] = category;
    return category;
  }
  throw new Error('Category not found');
};

export const deleteCategory = async (id: string): Promise<void> => {
  await delay(800);
  const index = categories.findIndex(c => c.id === id);
  if (index !== -1) {
    categories.splice(index, 1);
    return;
  }
  throw new Error('Category not found');
};

// Juice Items API
export const getJuices = async (): Promise<JuiceItem[]> => {
  await delay(700);
  return juices;
};

export const getJuiceById = async (id: string): Promise<JuiceItem | undefined> => {
  await delay(300);
  return juices.find(juice => juice.id === id);
};

export const getJuicesByCategory = async (categoryId: string): Promise<JuiceItem[]> => {
  await delay(500);
  return juices.filter(juice => juice.categoryId === categoryId && juice.isAvailable);
};

export const getFeaturedJuices = async (): Promise<JuiceItem[]> => {
  await delay(500);
  return juices.filter(juice => juice.isFeatured && juice.isAvailable);
};

export const createJuice = async (juice: Omit<JuiceItem, 'id'>): Promise<JuiceItem> => {
  await delay(1000);
  const newJuice = {
    ...juice,
    id: `juice-${Date.now()}`
  };
  juices.push(newJuice);
  return newJuice;
};

export const updateJuice = async (juice: JuiceItem): Promise<JuiceItem> => {
  await delay(1000);
  const index = juices.findIndex(j => j.id === juice.id);
  if (index !== -1) {
    juices[index] = juice;
    return juice;
  }
  throw new Error('Juice not found');
};

export const deleteJuice = async (id: string): Promise<void> => {
  await delay(800);
  const index = juices.findIndex(j => j.id === id);
  if (index !== -1) {
    juices.splice(index, 1);
    return;
  }
  throw new Error('Juice not found');
};

// Orders API
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  await delay(800);
  return mockOrders.filter(order => order.userId === userId);
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  await delay(300);
  return mockOrders.find(order => order.id === id);
};

export const getAllOrders = async (): Promise<Order[]> => {
  await delay(800);
  return mockOrders;
};

export const createOrder = async (userId: string, cart: Cart, address?: Address): Promise<Order> => {
  await delay(1500);
  
  const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const newOrder: Order = {
    id: `order-${Date.now()}`,
    userId,
    items: cart.items,
    totalAmount,
    orderType: cart.type,
    status: OrderStatus.PLACED,
    paymentId: `pay-${Date.now()}`,
    address: address,
    tableNo: cart.tableNo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockOrders.unshift(newOrder);
  toast.success('Order placed successfully!');
  return newOrder;
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
  await delay(500);
  
  const orderIndex = mockOrders.findIndex(order => order.id === orderId);
  if (orderIndex === -1) {
    throw new Error('Order not found');
  }
  
  mockOrders[orderIndex] = {
    ...mockOrders[orderIndex],
    status,
    updatedAt: new Date().toISOString()
  };
  
  return mockOrders[orderIndex];
};

// Dashboard API
export const getDashboardStats = async (): Promise<DashboardStats> => {
  await delay(800);
  return dashboardStats;
};

// Mock payment gateway
export const processPayment = async (amount: number): Promise<{ success: boolean, paymentId: string }> => {
  await delay(2000);
  
  // Simulate a payment with 90% success rate
  const success = Math.random() < 0.9;
  
  if (!success) {
    throw new Error('Payment processing failed. Please try again.');
  }
  
  return {
    success: true,
    paymentId: `pay-${Date.now()}`
  };
};

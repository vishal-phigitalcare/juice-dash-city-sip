
import { 
  Category, 
  JuiceItem, 
  CupSize, 
  Order, 
  OrderStatus, 
  OrderType,
  DashboardStats
} from '@/types/models';

export const categories: Category[] = [
  {
    id: 'cat1',
    name: 'Fruit Juices',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1000',
    isActive: true
  },
  {
    id: 'cat2',
    name: 'Vegetable Juices',
    image: 'https://images.unsplash.com/photo-1555949366-c511818912d0?q=80&w=1000',
    isActive: true
  },
  {
    id: 'cat3',
    name: 'Mixed Juices',
    image: 'https://images.unsplash.com/photo-1622597467836-f3e6707e1116?q=80&w=1000',
    isActive: true
  },
  {
    id: 'cat4',
    name: 'Smoothies',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a90a0853?q=80&w=1000',
    isActive: true
  },
  {
    id: 'cat5',
    name: 'Health Boosters',
    image: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?q=80&w=1000',
    isActive: true
  }
];

export const juices: JuiceItem[] = [
  {
    id: 'juice1',
    name: 'Fresh Orange Juice',
    description: 'Pure freshly squeezed orange juice packed with vitamin C and natural sweetness.',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=1000',
    categoryId: 'cat1',
    variants: [
      { size: CupSize.SMALL, price: 80, isAvailable: true },
      { size: CupSize.MEDIUM, price: 120, isAvailable: true },
      { size: CupSize.LARGE, price: 150, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'juice2',
    name: 'Watermelon Cooler',
    description: 'Refreshing watermelon juice perfect for hot summer days.',
    image: 'https://images.unsplash.com/photo-1527102298867-a405a0ecc112?q=80&w=1000',
    categoryId: 'cat1',
    variants: [
      { size: CupSize.SMALL, price: 70, isAvailable: true },
      { size: CupSize.MEDIUM, price: 110, isAvailable: true },
      { size: CupSize.LARGE, price: 140, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: false
  },
  {
    id: 'juice3',
    name: 'Green Detox',
    description: 'A healthy blend of spinach, cucumber, celery, and apple for detoxification.',
    image: 'https://images.unsplash.com/photo-1622597467836-f3e6707e1116?q=80&w=1000',
    categoryId: 'cat2',
    variants: [
      { size: CupSize.SMALL, price: 90, isAvailable: true },
      { size: CupSize.MEDIUM, price: 130, isAvailable: true },
      { size: CupSize.LARGE, price: 170, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'juice4',
    name: 'Carrot Ginger Boost',
    description: 'Nutritious carrot juice with a hint of ginger for improved immunity.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000',
    categoryId: 'cat2',
    variants: [
      { size: CupSize.SMALL, price: 85, isAvailable: true },
      { size: CupSize.MEDIUM, price: 125, isAvailable: true },
      { size: CupSize.LARGE, price: 165, isAvailable: false }
    ],
    isAvailable: true,
    isFeatured: false
  },
  {
    id: 'juice5',
    name: 'Berry Blast',
    description: 'A mix of strawberries, blueberries, and raspberries rich in antioxidants.',
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=1000',
    categoryId: 'cat3',
    variants: [
      { size: CupSize.SMALL, price: 95, isAvailable: true },
      { size: CupSize.MEDIUM, price: 135, isAvailable: true },
      { size: CupSize.LARGE, price: 175, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'juice6',
    name: 'Tropical Paradise',
    description: 'Sweet blend of pineapple, mango, and passion fruit for a tropical experience.',
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=1000',
    categoryId: 'cat3',
    variants: [
      { size: CupSize.SMALL, price: 100, isAvailable: true },
      { size: CupSize.MEDIUM, price: 140, isAvailable: true },
      { size: CupSize.LARGE, price: 180, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: false
  },
  {
    id: 'juice7',
    name: 'Banana Berry Smoothie',
    description: 'Creamy smoothie with banana, mixed berries, and yogurt.',
    image: 'https://images.unsplash.com/photo-1553787499-6f9133242796?q=80&w=1000',
    categoryId: 'cat4',
    variants: [
      { size: CupSize.SMALL, price: 110, isAvailable: true },
      { size: CupSize.MEDIUM, price: 150, isAvailable: true },
      { size: CupSize.LARGE, price: 190, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'juice8',
    name: 'Protein Power Smoothie',
    description: 'High protein smoothie with banana, peanut butter, and protein powder.',
    image: 'https://images.unsplash.com/photo-1553787499-6f9133242796?q=80&w=1000',
    categoryId: 'cat4',
    variants: [
      { size: CupSize.SMALL, price: 120, isAvailable: true },
      { size: CupSize.MEDIUM, price: 160, isAvailable: true },
      { size: CupSize.LARGE, price: 200, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: false
  },
  {
    id: 'juice9',
    name: 'Immunity Booster',
    description: 'A powerful blend of orange, ginger, turmeric, and honey to boost immunity.',
    image: 'https://images.unsplash.com/photo-1573806439793-82aa612294b3?q=80&w=1000',
    categoryId: 'cat5',
    variants: [
      { size: CupSize.SMALL, price: 100, isAvailable: true },
      { size: CupSize.MEDIUM, price: 140, isAvailable: true },
      { size: CupSize.LARGE, price: 180, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'juice10',
    name: 'Energy Kick',
    description: 'A blend of beetroot, apple, and ginger for enhanced energy and endurance.',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1000',
    categoryId: 'cat5',
    variants: [
      { size: CupSize.SMALL, price: 95, isAvailable: true },
      { size: CupSize.MEDIUM, price: 135, isAvailable: true },
      { size: CupSize.LARGE, price: 175, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: false
  }
];

// Generate some mock orders
const generateMockOrders = (): Order[] => {
  const orders: Order[] = [];
  
  // Past orders
  for (let i = 1; i <= 10; i++) {
    const orderItems = [
      {
        juiceId: 'juice1',
        juiceName: 'Fresh Orange Juice',
        image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=1000',
        size: CupSize.MEDIUM,
        price: 120,
        quantity: 1
      },
      {
        juiceId: 'juice5',
        juiceName: 'Berry Blast',
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=1000',
        size: CupSize.SMALL,
        price: 95,
        quantity: 2
      }
    ];
    
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    orders.push({
      id: `order-${i}`,
      userId: 'user-1',
      items: orderItems,
      totalAmount,
      orderType: i % 3 === 0 ? OrderType.DELIVERY : i % 3 === 1 ? OrderType.TAKEAWAY : OrderType.DINE_IN,
      status: OrderStatus.DELIVERED,
      paymentId: `pay-${i}`,
      address: i % 3 === 0 ? {
        id: 'addr-1',
        userId: 'user-1',
        name: 'Home',
        phone: '9876543210',
        address: '123 Main St, Apt 4B',
        city: 'Bhopal',
        state: 'Madhya Pradesh',
        pincode: '462001',
        isDefault: true
      } : undefined,
      tableNo: i % 3 === 2 ? '5' : undefined,
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString()
    });
  }
  
  // Recent/active orders
  const orderStatuses = [
    OrderStatus.PLACED,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.OUT_FOR_DELIVERY
  ];
  
  for (let i = 0; i < 5; i++) {
    const orderItems = [
      {
        juiceId: 'juice3',
        juiceName: 'Green Detox',
        image: 'https://images.unsplash.com/photo-1622597467836-f3e6707e1116?q=80&w=1000',
        size: CupSize.MEDIUM,
        price: 130,
        quantity: 1
      },
      {
        juiceId: 'juice7',
        juiceName: 'Banana Berry Smoothie',
        image: 'https://images.unsplash.com/photo-1553787499-6f9133242796?q=80&w=1000',
        size: CupSize.SMALL,
        price: 110,
        quantity: 1
      }
    ];
    
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    orders.push({
      id: `order-active-${i+1}`,
      userId: 'user-1',
      items: orderItems,
      totalAmount,
      orderType: i % 3 === 0 ? OrderType.DELIVERY : i % 3 === 1 ? OrderType.TAKEAWAY : OrderType.DINE_IN,
      status: orderStatuses[i],
      paymentId: `pay-active-${i+1}`,
      address: i % 3 === 0 ? {
        id: 'addr-1',
        userId: 'user-1',
        name: 'Home',
        phone: '9876543210',
        address: '123 Main St, Apt 4B',
        city: 'Bhopal',
        state: 'Madhya Pradesh',
        pincode: '462001',
        isDefault: true
      } : undefined,
      tableNo: i % 3 === 2 ? '3' : undefined,
      createdAt: new Date(Date.now() - i * 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - i * 15 * 60 * 1000).toISOString()
    });
  }
  
  return orders;
};

export const mockOrders = generateMockOrders();

export const dashboardStats: DashboardStats = {
  totalOrders: 578,
  totalEarnings: 87450,
  pendingOrders: 5,
  completedOrders: 573
};

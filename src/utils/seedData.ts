
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Category, JuiceItem, CupSize } from '@/types/models';

// Sample categories
const sampleCategories: Omit<Category, 'id'>[] = [
  {
    name: 'Fruit Juices',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=1287&ixlib=rb-4.0.3',
    isActive: true
  },
  {
    name: 'Vegetable Juices',
    image: 'https://images.unsplash.com/photo-1622597467836-f3e6bfa81511?auto=format&fit=crop&q=80&w=1364&ixlib=rb-4.0.3',
    isActive: true
  },
  {
    name: 'Smoothies',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a90bb110?auto=format&fit=crop&q=80&w=1286&ixlib=rb-4.0.3',
    isActive: true
  },
  {
    name: 'Detox Drinks',
    image: 'https://images.unsplash.com/photo-1572091583014-16c7430fa403?auto=format&fit=crop&q=80&w=1287&ixlib=rb-4.0.3',
    isActive: true
  }
];

// Define interface for a juice item without id to prevent excessive type depth
interface JuiceItemWithoutId {
  name: string;
  description: string;
  image: string;
  categoryId: string;
  variants: JuiceVariant[];
  isAvailable: boolean;
  isFeatured: boolean;
}

// Define JuiceVariant interface to avoid recursive imports
interface JuiceVariant {
  size: CupSize;
  price: number;
  isAvailable: boolean;
}

// Sample juice items - Fix the recursive type issue by explicitly defining the return types
const getFruitJuices = (categoryId: string): JuiceItemWithoutId[] => [
  {
    name: 'Orange Juice',
    description: 'Freshly squeezed orange juice full of vitamin C.',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=1287&ixlib=rb-4.0.3',
    categoryId,
    variants: [
      { size: CupSize.SMALL, price: 70, isAvailable: true },
      { size: CupSize.MEDIUM, price: 130, isAvailable: true },
      { size: CupSize.LARGE, price: 180, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: true
  },
  {
    name: 'Apple Juice',
    description: 'Sweet and refreshing apple juice made from red apples.',
    image: 'https://images.unsplash.com/photo-1576673442511-7e39b6545c87?auto=format&fit=crop&q=80&w=1288&ixlib=rb-4.0.3',
    categoryId,
    variants: [
      { size: CupSize.SMALL, price: 80, isAvailable: true },
      { size: CupSize.MEDIUM, price: 140, isAvailable: true },
      { size: CupSize.LARGE, price: 190, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: false
  },
  {
    name: 'Watermelon Juice',
    description: 'Refreshing watermelon juice perfect for hot days.',
    image: 'https://images.unsplash.com/photo-1527090526205-beaac8dc3c62?auto=format&fit=crop&q=80&w=1287&ixlib=rb-4.0.3',
    categoryId,
    variants: [
      { size: CupSize.SMALL, price: 60, isAvailable: true },
      { size: CupSize.MEDIUM, price: 120, isAvailable: true },
      { size: CupSize.LARGE, price: 170, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: true
  },
];

const getVegetableJuices = (categoryId: string): JuiceItemWithoutId[] => [
  {
    name: 'Carrot Juice',
    description: 'Healthy carrot juice rich in vitamin A and antioxidants.',
    image: 'https://images.unsplash.com/photo-1622597467836-f3e6bfa81511?auto=format&fit=crop&q=80&w=1364&ixlib=rb-4.0.3',
    categoryId,
    variants: [
      { size: CupSize.SMALL, price: 75, isAvailable: true },
      { size: CupSize.MEDIUM, price: 135, isAvailable: true },
      { size: CupSize.LARGE, price: 185, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: false
  },
  {
    name: 'Beetroot Juice',
    description: 'Vibrant beetroot juice with powerful health benefits.',
    image: 'https://images.unsplash.com/photo-1637197702551-138df0e0e19a?auto=format&fit=crop&q=80&w=1287&ixlib=rb-4.0.3',
    categoryId,
    variants: [
      { size: CupSize.SMALL, price: 90, isAvailable: true },
      { size: CupSize.MEDIUM, price: 150, isAvailable: true },
      { size: CupSize.LARGE, price: 200, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: true
  },
];

const getSmoothies = (categoryId: string): JuiceItemWithoutId[] => [
  {
    name: 'Berry Blast',
    description: 'A mix of strawberries, blueberries, and raspberries for a fruity delight.',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a90bb110?auto=format&fit=crop&q=80&w=1286&ixlib=rb-4.0.3',
    categoryId,
    variants: [
      { size: CupSize.SMALL, price: 100, isAvailable: true },
      { size: CupSize.MEDIUM, price: 160, isAvailable: true },
      { size: CupSize.LARGE, price: 220, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: true
  },
  {
    name: 'Banana Smoothie',
    description: 'Creamy banana smoothie for a quick energy boost.',
    image: 'https://images.unsplash.com/photo-1571805423089-2b6c0e9284b3?auto=format&fit=crop&q=80&w=1287&ixlib=rb-4.0.3',
    categoryId,
    variants: [
      { size: CupSize.SMALL, price: 90, isAvailable: true },
      { size: CupSize.MEDIUM, price: 150, isAvailable: true },
      { size: CupSize.LARGE, price: 210, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: false
  },
];

const getDetoxDrinks = (categoryId: string): JuiceItemWithoutId[] => [
  {
    name: 'Green Detox',
    description: 'A mix of spinach, cucumber, celery, and apple for a cleansing effect.',
    image: 'https://images.unsplash.com/photo-1572091583014-16c7430fa403?auto=format&fit=crop&q=80&w=1287&ixlib=rb-4.0.3',
    categoryId,
    variants: [
      { size: CupSize.SMALL, price: 110, isAvailable: true },
      { size: CupSize.MEDIUM, price: 170, isAvailable: true },
      { size: CupSize.LARGE, price: 230, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: true
  },
  {
    name: 'Lemon Ginger Detox',
    description: 'Refreshing lemon and ginger detox drink to boost your immune system.',
    image: 'https://images.unsplash.com/photo-1556679343-c1306ee9277f?auto=format&fit=crop&q=80&w=1364&ixlib=rb-4.0.3',
    categoryId,
    variants: [
      { size: CupSize.SMALL, price: 100, isAvailable: true },
      { size: CupSize.MEDIUM, price: 160, isAvailable: true },
      { size: CupSize.LARGE, price: 220, isAvailable: true }
    ],
    isAvailable: true,
    isFeatured: false
  },
];

// Function to create admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const { data: existingAdmin } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin@example.com')
      .single();

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user in auth
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@example.com',
      password: 'Admin@123456',
      options: {
        data: {
          name: 'Admin User',
          role: 'admin'
        },
      },
    });

    if (error) throw error;

    console.log('Admin user created successfully');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Function to seed categories
const seedCategories = async (): Promise<string[]> => {
  const categoryIds: string[] = [];
  
  try {
    for (const category of sampleCategories) {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          image: category.image,
          is_active: category.isActive
        })
        .select()
        .single();
      
      if (error) throw error;
      
      categoryIds.push(data.id);
      console.log(`Category created: ${category.name}`);
    }
    
    return categoryIds;
  } catch (error) {
    console.error('Error seeding categories:', error);
    return categoryIds;
  }
};

// Function to seed juice items
const seedJuiceItems = async (categoryIds: string[]) => {
  try {
    if (categoryIds.length < 4) {
      throw new Error('Not enough category IDs to seed juice items');
    }
    
    // Add fruit juices
    const fruitJuices = getFruitJuices(categoryIds[0]);
    for (const juice of fruitJuices) {
      await createJuiceItem(juice);
    }
    
    // Add vegetable juices
    const vegetableJuices = getVegetableJuices(categoryIds[1]);
    for (const juice of vegetableJuices) {
      await createJuiceItem(juice);
    }
    
    // Add smoothies
    const smoothies = getSmoothies(categoryIds[2]);
    for (const juice of smoothies) {
      await createJuiceItem(juice);
    }
    
    // Add detox drinks
    const detoxDrinks = getDetoxDrinks(categoryIds[3]);
    for (const juice of detoxDrinks) {
      await createJuiceItem(juice);
    }
    
    console.log('All juice items seeded successfully');
  } catch (error) {
    console.error('Error seeding juice items:', error);
  }
};

// Helper function to create a juice item with its variants
const createJuiceItem = async (juice: JuiceItemWithoutId) => {
  try {
    // Create the juice item
    const { data, error } = await supabase
      .from('juice_items')
      .insert({
        name: juice.name,
        description: juice.description,
        image: juice.image,
        category_id: juice.categoryId,
        is_available: juice.isAvailable,
        is_featured: juice.isFeatured
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Create variants for the juice
    for (const variant of juice.variants) {
      const { error: variantError } = await supabase
        .from('juice_variants')
        .insert({
          juice_id: data.id,
          size: variant.size,
          price: variant.price,
          is_available: variant.isAvailable
        });
      
      if (variantError) throw variantError;
    }
    
    console.log(`Juice item created: ${juice.name}`);
  } catch (error) {
    console.error(`Error creating juice item ${juice.name}:`, error);
  }
};

// Main seed function
export const seedDatabase = async () => {
  try {
    // Create admin user
    await createAdminUser();
    
    // Check if we already have categories
    const { count: categoryCount, error: countError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    // Only seed categories and items if we don't have any yet
    if (categoryCount === 0) {
      const categoryIds = await seedCategories();
      
      if (categoryIds.length > 0) {
        await seedJuiceItems(categoryIds);
      }
      
      toast.success('Database seeded successfully!');
    } else {
      console.log('Database already has data, skipping seed');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    toast.error('Failed to seed database');
  }
};

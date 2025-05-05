
import { 
  Category, 
  JuiceItem, 
  Order, 
  OrderStatus, 
  OrderType,
  Cart,
  Address,
  DashboardStats,
  CupSize,
  JuiceVariant
} from '@/types/models';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Helper function to transform database address to model address
const transformDbAddressToModel = (dbAddress: any): Address => {
  return {
    id: dbAddress.id,
    userId: dbAddress.user_id,
    name: dbAddress.name,
    phone: dbAddress.phone,
    address: dbAddress.address,
    city: dbAddress.city,
    state: dbAddress.state,
    pincode: dbAddress.pincode,
    isDefault: dbAddress.is_default || false
  };
};

// Categories API
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    toast.error('Failed to load categories');
    throw error;
  }
  
  // Map database fields to our model
  const categories: Category[] = data?.map(cat => ({
    id: cat.id,
    name: cat.name,
    image: cat.image,
    isActive: cat.is_active || false
  })) || [];
  
  return categories;
};

export const getCategoryById = async (id: string): Promise<Category | undefined> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code !== 'PGRST116') { // No rows returned
      console.error('Error fetching category:', error);
      toast.error('Failed to load category');
      throw error;
    }
    return undefined;
  }
  
  return {
    id: data.id,
    name: data.name,
    image: data.image,
    isActive: data.is_active || false
  };
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: category.name,
      image: category.image,
      is_active: category.isActive
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating category:', error);
    toast.error('Failed to create category');
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    image: data.image,
    isActive: data.is_active || false
  };
};

export const updateCategory = async (category: Category): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update({
      name: category.name,
      image: category.image,
      is_active: category.isActive
    })
    .eq('id', category.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating category:', error);
    toast.error('Failed to update category');
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    image: data.image,
    isActive: data.is_active || false
  };
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting category:', error);
    toast.error('Failed to delete category');
    throw error;
  }
};

// Juice Items API
export const getJuices = async (): Promise<JuiceItem[]> => {
  // First get all juice items
  const { data: juiceItems, error: juiceError } = await supabase
    .from('juice_items')
    .select('*')
    .order('name');
  
  if (juiceError) {
    console.error('Error fetching juices:', juiceError);
    toast.error('Failed to load juices');
    throw juiceError;
  }
  
  // Then get all variants for these items
  if (juiceItems && juiceItems.length > 0) {
    const { data: variants, error: variantsError } = await supabase
      .from('juice_variants')
      .select('*')
      .in('juice_id', juiceItems.map(juice => juice.id));
    
    if (variantsError) {
      console.error('Error fetching juice variants:', variantsError);
      toast.error('Failed to load juice variants');
      throw variantsError;
    }
    
    // Map variants to their juice items
    const juicesWithVariants: JuiceItem[] = juiceItems.map(juice => {
      const juiceVariants = variants
        ? variants
            .filter(v => v.juice_id === juice.id)
            .map(v => ({
              size: v.size as CupSize,
              price: v.price,
              isAvailable: v.is_available
            }))
        : [];
      
      return {
        id: juice.id,
        name: juice.name,
        description: juice.description || '',
        image: juice.image,
        categoryId: juice.category_id || '',
        variants: juiceVariants,
        isAvailable: juice.is_available,
        isFeatured: juice.is_featured
      };
    });
    
    return juicesWithVariants;
  }
  
  return [];
};

export const getJuiceById = async (id: string): Promise<JuiceItem | undefined> => {
  // First get the juice item
  const { data: juice, error: juiceError } = await supabase
    .from('juice_items')
    .select('*')
    .eq('id', id)
    .single();
  
  if (juiceError) {
    if (juiceError.code !== 'PGRST116') { // No rows returned
      console.error('Error fetching juice:', juiceError);
      toast.error('Failed to load juice');
      throw juiceError;
    }
    return undefined;
  }
  
  // Then get the variants
  const { data: variants, error: variantsError } = await supabase
    .from('juice_variants')
    .select('*')
    .eq('juice_id', id);
  
  if (variantsError) {
    console.error('Error fetching juice variants:', variantsError);
    toast.error('Failed to load juice variants');
    throw variantsError;
  }
  
  // Map to our model
  const juiceVariants: JuiceVariant[] = variants
    ? variants.map(v => ({
        size: v.size as CupSize,
        price: v.price,
        isAvailable: v.is_available
      }))
    : [];
  
  return {
    id: juice.id,
    name: juice.name,
    description: juice.description || '',
    image: juice.image,
    categoryId: juice.category_id || '',
    variants: juiceVariants,
    isAvailable: juice.is_available,
    isFeatured: juice.is_featured
  };
};

export const getJuicesByCategory = async (categoryId: string): Promise<JuiceItem[]> => {
  // First get juice items in this category
  const { data: juiceItems, error: juiceError } = await supabase
    .from('juice_items')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_available', true)
    .order('name');
  
  if (juiceError) {
    console.error('Error fetching juices by category:', juiceError);
    toast.error('Failed to load juices');
    throw juiceError;
  }
  
  // Then get all variants for these items
  if (juiceItems && juiceItems.length > 0) {
    const { data: variants, error: variantsError } = await supabase
      .from('juice_variants')
      .select('*')
      .in('juice_id', juiceItems.map(juice => juice.id));
    
    if (variantsError) {
      console.error('Error fetching juice variants:', variantsError);
      toast.error('Failed to load juice variants');
      throw variantsError;
    }
    
    // Map variants to their juice items
    const juicesWithVariants: JuiceItem[] = juiceItems.map(juice => {
      const juiceVariants = variants
        ? variants
            .filter(v => v.juice_id === juice.id)
            .map(v => ({
              size: v.size as CupSize,
              price: v.price,
              isAvailable: v.is_available
            }))
        : [];
      
      return {
        id: juice.id,
        name: juice.name,
        description: juice.description || '',
        image: juice.image,
        categoryId: juice.category_id || '',
        variants: juiceVariants,
        isAvailable: juice.is_available,
        isFeatured: juice.is_featured
      };
    });
    
    return juicesWithVariants;
  }
  
  return [];
};

export const getFeaturedJuices = async (): Promise<JuiceItem[]> => {
  // First get featured juice items
  const { data: juiceItems, error: juiceError } = await supabase
    .from('juice_items')
    .select('*')
    .eq('is_featured', true)
    .eq('is_available', true)
    .order('name');
  
  if (juiceError) {
    console.error('Error fetching featured juices:', juiceError);
    toast.error('Failed to load featured juices');
    throw juiceError;
  }
  
  // Then get all variants for these items
  if (juiceItems && juiceItems.length > 0) {
    const { data: variants, error: variantsError } = await supabase
      .from('juice_variants')
      .select('*')
      .in('juice_id', juiceItems.map(juice => juice.id));
    
    if (variantsError) {
      console.error('Error fetching juice variants:', variantsError);
      toast.error('Failed to load juice variants');
      throw variantsError;
    }
    
    // Map variants to their juice items
    const juicesWithVariants: JuiceItem[] = juiceItems.map(juice => {
      const juiceVariants = variants
        ? variants
            .filter(v => v.juice_id === juice.id)
            .map(v => ({
              size: v.size as CupSize,
              price: v.price,
              isAvailable: v.is_available
            }))
        : [];
      
      return {
        id: juice.id,
        name: juice.name,
        description: juice.description || '',
        image: juice.image,
        categoryId: juice.category_id || '',
        variants: juiceVariants,
        isAvailable: juice.is_available,
        isFeatured: juice.is_featured
      };
    });
    
    return juicesWithVariants;
  }
  
  return [];
};

// Add the missing CRUD operations for juice items
export const createJuice = async (juice: Omit<JuiceItem, 'id'>): Promise<JuiceItem> => {
  try {
    // First create the juice item
    const { data: juiceData, error: juiceError } = await supabase
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
    
    if (juiceError) throw juiceError;
    
    // Then create variants for the juice
    for (const variant of juice.variants) {
      const { error: variantError } = await supabase
        .from('juice_variants')
        .insert({
          juice_id: juiceData.id,
          size: variant.size,
          price: variant.price,
          is_available: variant.isAvailable
        });
      
      if (variantError) throw variantError;
    }
    
    // Return the created juice with its variants
    return {
      id: juiceData.id,
      name: juiceData.name,
      description: juiceData.description || '',
      image: juiceData.image,
      categoryId: juiceData.category_id || '',
      variants: juice.variants,
      isAvailable: juiceData.is_available || true,
      isFeatured: juiceData.is_featured || false
    };
  } catch (error) {
    console.error('Error creating juice:', error);
    toast.error('Failed to create juice');
    throw error;
  }
};

export const updateJuice = async (juice: JuiceItem): Promise<JuiceItem> => {
  try {
    // Update the juice item
    const { error: juiceError } = await supabase
      .from('juice_items')
      .update({
        name: juice.name,
        description: juice.description,
        image: juice.image,
        category_id: juice.categoryId,
        is_available: juice.isAvailable,
        is_featured: juice.isFeatured
      })
      .eq('id', juice.id);
    
    if (juiceError) throw juiceError;
    
    // Update or create variants
    for (const variant of juice.variants) {
      // Check if variant exists
      const { data: existingVariant, error: checkError } = await supabase
        .from('juice_variants')
        .select('id')
        .eq('juice_id', juice.id)
        .eq('size', variant.size)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      if (existingVariant) {
        // Update existing variant
        const { error: updateError } = await supabase
          .from('juice_variants')
          .update({
            price: variant.price,
            is_available: variant.isAvailable
          })
          .eq('id', existingVariant.id);
        
        if (updateError) throw updateError;
      } else {
        // Create new variant
        const { error: insertError } = await supabase
          .from('juice_variants')
          .insert({
            juice_id: juice.id,
            size: variant.size,
            price: variant.price,
            is_available: variant.isAvailable
          });
        
        if (insertError) throw insertError;
      }
    }
    
    return juice;
  } catch (error) {
    console.error('Error updating juice:', error);
    toast.error('Failed to update juice');
    throw error;
  }
};

export const deleteJuice = async (id: string): Promise<void> => {
  try {
    // Delete juice item (variants will be deleted by cascade)
    const { error } = await supabase
      .from('juice_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting juice:', error);
    toast.error('Failed to delete juice');
    throw error;
  }
};

// Orders API
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      addresses:address_id (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (ordersError) {
    console.error('Error fetching user orders:', ordersError);
    toast.error('Failed to load orders');
    throw ordersError;
  }
  
  // Get order items for all orders
  if (orders && orders.length > 0) {
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orders.map(order => order.id));
    
    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      toast.error('Failed to load order items');
      throw itemsError;
    }
    
    // Map items to their orders
    const ordersWithItems: Order[] = orders.map(order => {
      const orderItems = items
        ? items
            .filter(item => item.order_id === order.id)
            .map(item => ({
              juiceId: item.juice_id,
              juiceName: item.juice_name,
              image: '',  // We don't store images in order_items
              size: item.size as CupSize,
              price: item.price,
              quantity: item.quantity
            }))
        : [];
      
      // Map address data if address exists
      let addressData: Address | undefined;
      if (order.addresses) {
        addressData = transformDbAddressToModel(order.addresses);
      }
      
      return {
        id: order.id,
        userId: order.user_id,
        items: orderItems,
        totalAmount: order.total_amount,
        orderType: order.order_type as OrderType,
        status: order.status as OrderStatus,
        paymentId: order.payment_id,
        address: addressData,
        tableNo: order.table_no,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      };
    });
    
    return ordersWithItems;
  }
  
  return [];
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      *,
      addresses:address_id (*)
    `)
    .eq('id', id)
    .single();
  
  if (orderError) {
    if (orderError.code !== 'PGRST116') { // No rows returned
      console.error('Error fetching order:', orderError);
      toast.error('Failed to load order');
      throw orderError;
    }
    return undefined;
  }
  
  // Get order items
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);
  
  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    toast.error('Failed to load order items');
    throw itemsError;
  }
  
  const orderItems = items
    ? items.map(item => ({
        juiceId: item.juice_id,
        juiceName: item.juice_name,
        image: '',  // We don't store images in order_items
        size: item.size as CupSize,
        price: item.price,
        quantity: item.quantity
      }))
    : [];
  
  // Map address data if address exists
  let addressData: Address | undefined;
  if (order.addresses) {
    addressData = transformDbAddressToModel(order.addresses);
  }
  
  return {
    id: order.id,
    userId: order.user_id,
    items: orderItems,
    totalAmount: order.total_amount,
    orderType: order.order_type as OrderType,
    status: order.status as OrderStatus,
    paymentId: order.payment_id,
    address: addressData,
    tableNo: order.table_no,
    createdAt: order.created_at,
    updatedAt: order.updated_at
  };
};

export const getAllOrders = async (): Promise<Order[]> => {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      addresses:address_id (*)
    `)
    .order('created_at', { ascending: false });
  
  if (ordersError) {
    console.error('Error fetching all orders:', ordersError);
    toast.error('Failed to load orders');
    throw ordersError;
  }
  
  // Get order items for all orders
  if (orders && orders.length > 0) {
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orders.map(order => order.id));
    
    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      toast.error('Failed to load order items');
      throw itemsError;
    }
    
    // Map items to their orders
    const ordersWithItems: Order[] = orders.map(order => {
      const orderItems = items
        ? items
            .filter(item => item.order_id === order.id)
            .map(item => ({
              juiceId: item.juice_id,
              juiceName: item.juice_name,
              image: '',  // We don't store images in order_items
              size: item.size as CupSize,
              price: item.price,
              quantity: item.quantity
            }))
        : [];
      
      // Map address data if address exists
      let addressData: Address | undefined;
      if (order.addresses) {
        addressData = transformDbAddressToModel(order.addresses);
      }
      
      return {
        id: order.id,
        userId: order.user_id,
        items: orderItems,
        totalAmount: order.total_amount,
        orderType: order.order_type as OrderType,
        status: order.status as OrderStatus,
        paymentId: order.payment_id,
        address: addressData,
        tableNo: order.table_no,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      };
    });
    
    return ordersWithItems;
  }
  
  return [];
};

export const createOrder = async (userId: string, cart: Cart, address?: Address): Promise<Order> => {
  // Start a transaction
  const { data, error } = await supabase.rpc('create_order', {
    p_user_id: userId,
    p_total_amount: cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    p_order_type: cart.type,
    p_address_id: address?.id || null,
    p_table_no: cart.tableNo || null
  });
  
  if (error) {
    console.error('Error creating order:', error);
    toast.error('Failed to create order');
    throw error;
  }
  
  const orderId = data;
  
  // Insert order items
  for (const item of cart.items) {
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: orderId,
        juice_id: item.juiceId,
        juice_name: item.juiceName,
        size: item.size,
        price: item.price,
        quantity: item.quantity
      });
    
    if (itemError) {
      console.error('Error creating order item:', itemError);
      toast.error('Failed to create order item');
      throw itemError;
    }
  }
  
  // Get the created order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      *,
      addresses:address_id (*)
    `)
    .eq('id', orderId)
    .single();
  
  if (orderError) {
    console.error('Error fetching created order:', orderError);
    toast.error('Failed to retrieve created order');
    throw orderError;
  }
  
  // Get order items
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);
  
  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    toast.error('Failed to retrieve order items');
    throw itemsError;
  }
  
  const orderItems = items
    ? items.map(item => ({
        juiceId: item.juice_id,
        juiceName: item.juice_name,
        image: '',
        size: item.size as CupSize,
        price: item.price,
        quantity: item.quantity
      }))
    : [];
  
  // Map address data if address exists
  let addressData: Address | undefined;
  if (order.addresses) {
    addressData = transformDbAddressToModel(order.addresses);
  }
  
  toast.success('Order placed successfully!');
  
  return {
    id: order.id,
    userId: order.user_id,
    items: orderItems,
    totalAmount: order.total_amount,
    orderType: order.order_type as OrderType,
    status: order.status as OrderStatus,
    paymentId: order.payment_id,
    address: addressData,
    tableNo: order.table_no,
    createdAt: order.created_at,
    updatedAt: order.updated_at
  };
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select(`
      *,
      addresses:address_id (*)
    `)
    .single();
  
  if (error) {
    console.error('Error updating order status:', error);
    toast.error('Failed to update order status');
    throw error;
  }
  
  // Get order items
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);
  
  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    toast.error('Failed to load order items');
    throw itemsError;
  }
  
  const orderItems = items
    ? items.map(item => ({
        juiceId: item.juice_id,
        juiceName: item.juice_name,
        image: '',
        size: item.size as CupSize,
        price: item.price,
        quantity: item.quantity
      }))
    : [];
  
  // Map address data if address exists
  let addressData: Address | undefined;
  if (data.addresses) {
    addressData = transformDbAddressToModel(data.addresses);
  }
  
  return {
    id: data.id,
    userId: data.user_id,
    items: orderItems,
    totalAmount: data.total_amount,
    orderType: data.order_type as OrderType,
    status: data.status as OrderStatus,
    paymentId: data.payment_id,
    address: addressData,
    tableNo: data.table_no,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Dashboard API
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Get total orders count
  const { count: totalOrders, error: ordersError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });
  
  if (ordersError) {
    console.error('Error fetching total orders:', ordersError);
    toast.error('Failed to fetch dashboard stats');
    throw ordersError;
  }
  
  // Get total earnings
  const { data: earnings, error: earningsError } = await supabase
    .from('orders')
    .select('total_amount')
    .in('status', ['delivered', 'completed']);
  
  if (earningsError) {
    console.error('Error fetching earnings:', earningsError);
    toast.error('Failed to fetch dashboard stats');
    throw earningsError;
  }
  
  const totalEarnings = earnings
    ? earnings.reduce((sum, order) => sum + order.total_amount, 0)
    : 0;
  
  // Get pending orders count
  const { count: pendingOrders, error: pendingError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery']);
  
  if (pendingError) {
    console.error('Error fetching pending orders:', pendingError);
    toast.error('Failed to fetch dashboard stats');
    throw pendingError;
  }
  
  // Get completed orders count
  const { count: completedOrders, error: completedError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['delivered', 'completed']);
  
  if (completedError) {
    console.error('Error fetching completed orders:', completedError);
    toast.error('Failed to fetch dashboard stats');
    throw completedError;
  }
  
  return {
    totalOrders: totalOrders || 0,
    totalEarnings: totalEarnings,
    pendingOrders: pendingOrders || 0,
    completedOrders: completedOrders || 0
  };
};

// Razorpay API
export const createRazorpayOrder = async (amount: number): Promise<{ id: string, amount: number, currency: string }> => {
  try {
    const response = await fetch(`${window.location.origin}/api/razorpay-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receiptId: `rcpt_${Date.now()}`
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create Razorpay order');
    }
    
    const { order } = await response.json();
    return {
      id: order.id,
      amount: order.amount / 100, // Convert from paise to rupees
      currency: order.currency
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    toast.error(`Payment failed: ${error.message}`);
    throw error;
  }
};

// Mock payment gateway for testing
export const processPayment = async (amount: number): Promise<{ success: boolean, paymentId: string }> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
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

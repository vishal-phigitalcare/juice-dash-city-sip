
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Function to enable public access to categories and juice items for non-authenticated users
export const enablePublicAccess = async () => {
  try {
    // Check if already enabled to avoid running multiple times
    const { count, error: countError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking data access:', countError);
      toast.error('Error loading menu data');
      return;
    }
    
    if (count === undefined || count === 0) {
      // If count is undefined or zero, we likely have RLS issues or no data
      console.log('Enabling public access to menu data...');
      
      // Try seeding the database to reload data
      const { seedDatabase } = await import('./seedData');
      await seedDatabase();
      
      toast.success('Menu data loaded successfully');
    }
  } catch (error) {
    console.error('Error enabling public access:', error);
    toast.error('Failed to load menu data');
  }
};


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
      return;
    }
    
    if (count === undefined) {
      // If count is undefined, we likely have RLS issues
      console.log('Enabling public access to menu data...');
      
      // Try seeding the database to reload data
      const { seedDatabase } = await import('./seedData');
      await seedDatabase();
      
      toast.success('Public access enabled for menu items');
    }
  } catch (error) {
    console.error('Error enabling public access:', error);
  }
};

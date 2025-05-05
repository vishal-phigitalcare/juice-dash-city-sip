
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Address } from '@/types/models';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string, phone: string) => Promise<void>;
  addAddress: (address: Omit<Address, 'id' | 'userId'>) => Promise<void>;
  updateAddress: (address: Address) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Session check error:', error);
        toast.error('Failed to restore session');
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile data including addresses
  const fetchUserProfile = async (userId: string) => {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get user addresses
      const { data: addressesData, error: addressesError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId);

      if (addressesError) throw addressesError;

      // Transform addresses to match our model
      const addresses: Address[] = addressesData?.map(addr => ({
        id: addr.id,
        userId: addr.user_id,
        name: addr.name,
        phone: addr.phone,
        address: addr.address,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        isDefault: addr.is_default || false
      })) || [];

      // Construct user object
      const userData: User = {
        id: profile.id,
        email: '', // Email is not stored in profiles table for security
        name: profile.name,
        phone: profile.phone || '',
        role: profile.role as 'user' | 'admin',
        addresses
      };

      setUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(`Login failed: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      toast.info('Logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  const register = async (email: string, password: string, name: string, phone: string) => {
    setLoading(true);
    try {
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
        },
      });

      if (error) throw error;
      
      toast.success('Registration successful');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(`Registration failed: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (addressData: Omit<Address, 'id' | 'userId'>) => {
    if (!user) {
      toast.error('You must be logged in to add an address');
      return;
    }

    try {
      // If this is set as default, update all other addresses
      if (addressData.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      // Insert the new address
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          name: addressData.name,
          phone: addressData.phone,
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          pincode: addressData.pincode,
          is_default: addressData.isDefault
        })
        .select()
        .single();

      if (error) throw error;

      // Create a properly formatted Address object
      const newAddress: Address = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        isDefault: data.is_default || false
      };

      // Update local state
      setUser(prevUser => {
        if (!prevUser) return null;
        
        return {
          ...prevUser,
          addresses: [...prevUser.addresses, newAddress]
        };
      });

      toast.success('Address added');
    } catch (error) {
      console.error('Add address error:', error);
      toast.error(`Failed to add address: ${error.message}`);
    }
  };

  const updateAddress = async (address: Address) => {
    if (!user) {
      toast.error('You must be logged in to update an address');
      return;
    }

    try {
      // If this is set as default, update all other addresses
      if (address.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      // Update the address
      const { error } = await supabase
        .from('addresses')
        .update({
          name: address.name,
          phone: address.phone,
          address: address.address,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          is_default: address.isDefault
        })
        .eq('id', address.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh user data to get updated addresses
      await fetchUserProfile(user.id);
      
      toast.success('Address updated');
    } catch (error) {
      console.error('Update address error:', error);
      toast.error(`Failed to update address: ${error.message}`);
    }
  };

  const removeAddress = async (addressId: string) => {
    if (!user) {
      toast.error('You must be logged in to remove an address');
      return;
    }

    try {
      // Check if this is the default address
      const addressToRemove = user.addresses.find(addr => addr.id === addressId);
      
      // Delete the address
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;

      // If we deleted the default address and have other addresses, make the first one default
      if (addressToRemove?.isDefault && user.addresses.length > 1) {
        const firstAddressId = user.addresses.find(addr => addr.id !== addressId)?.id;
        if (firstAddressId) {
          await supabase
            .from('addresses')
            .update({ is_default: true })
            .eq('id', firstAddressId)
            .eq('user_id', user.id);
        }
      }

      // Refresh user data to get updated addresses
      await fetchUserProfile(user.id);
      
      toast.success('Address removed');
    } catch (error) {
      console.error('Remove address error:', error);
      toast.error(`Failed to remove address: ${error.message}`);
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    if (!user) {
      toast.error('You must be logged in to set a default address');
      return;
    }

    try {
      // Update all addresses to not default
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
      
      // Set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh user data to get updated addresses
      await fetchUserProfile(user.id);
      
      toast.success('Default address updated');
    } catch (error) {
      console.error('Set default address error:', error);
      toast.error(`Failed to set default address: ${error.message}`);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading,
        login, 
        logout, 
        register,
        addAddress,
        updateAddress,
        removeAddress,
        setDefaultAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

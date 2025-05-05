
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Address } from '@/types/models';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string, phone: string) => Promise<void>;
  addAddress: (address: Omit<Address, 'id' | 'userId'>) => void;
  updateAddress: (address: Address) => void;
  removeAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
}

// Mock data for demo purposes
const mockUser: User = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  phone: '9876543210',
  role: 'user',
  addresses: [
    {
      id: 'addr-1',
      userId: 'user-1',
      name: 'Home',
      phone: '9876543210',
      address: '123 Main St, Apt 4B',
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      pincode: '462001',
      isDefault: true
    }
  ]
};

const mockAdminUser: User = {
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Admin User',
  phone: '9876543210',
  role: 'admin',
  addresses: []
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved auth in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock login - in a real app this would call an API
      if (email === 'user@example.com' && password === 'password') {
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        toast.success('Login successful');
      } else if (email === 'admin@example.com' && password === 'password') {
        setUser(mockAdminUser);
        localStorage.setItem('user', JSON.stringify(mockAdminUser));
        toast.success('Admin login successful');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed: ' + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info('Logged out');
  };

  const register = async (email: string, password: string, name: string, phone: string) => {
    setLoading(true);
    try {
      // Mock registration - in a real app this would call an API
      const newUser: User = {
        ...mockUser,
        id: 'user-' + Date.now(),
        email,
        name,
        phone,
        addresses: []
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      toast.success('Registration successful');
    } catch (error) {
      toast.error('Registration failed: ' + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addAddress = (addressData: Omit<Address, 'id' | 'userId'>) => {
    if (!user) return;

    const newAddress: Address = {
      ...addressData,
      id: 'addr-' + Date.now(),
      userId: user.id,
      isDefault: user.addresses.length === 0 ? true : addressData.isDefault
    };

    let updatedAddresses: Address[];
    
    if (newAddress.isDefault) {
      // If this is set as default, update all other addresses
      updatedAddresses = user.addresses.map(addr => ({
        ...addr,
        isDefault: false
      }));
      updatedAddresses.push(newAddress);
    } else {
      updatedAddresses = [...user.addresses, newAddress];
    }

    const updatedUser = { ...user, addresses: updatedAddresses };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    toast.success('Address added');
  };

  const updateAddress = (address: Address) => {
    if (!user) return;

    let updatedAddresses: Address[];
    
    if (address.isDefault) {
      // If this is set as default, update all other addresses
      updatedAddresses = user.addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === address.id
      }));
    } else {
      updatedAddresses = user.addresses.map(addr => 
        addr.id === address.id ? address : addr
      );
    }

    const updatedUser = { ...user, addresses: updatedAddresses };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    toast.success('Address updated');
  };

  const removeAddress = (addressId: string) => {
    if (!user) return;

    let removedDefault = false;
    const filteredAddresses = user.addresses.filter(addr => {
      if (addr.id === addressId && addr.isDefault) {
        removedDefault = true;
      }
      return addr.id !== addressId;
    });

    // If we removed the default address and have other addresses, make the first one default
    if (removedDefault && filteredAddresses.length > 0) {
      filteredAddresses[0].isDefault = true;
    }

    const updatedUser = { ...user, addresses: filteredAddresses };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    toast.success('Address removed');
  };

  const setDefaultAddress = (addressId: string) => {
    if (!user) return;

    const updatedAddresses = user.addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));

    const updatedUser = { ...user, addresses: updatedAddresses };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    toast.success('Default address updated');
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


import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Cart, OrderType, CupSize } from '@/types/models';
import { toast } from 'sonner';

interface CartContextType {
  cart: Cart;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (juiceId: string, size: CupSize) => void;
  updateQuantity: (juiceId: string, size: CupSize, quantity: number) => void;
  clearCart: () => void;
  setOrderType: (type: OrderType) => void;
  setAddressId: (addressId: string) => void;
  setTableNo: (tableNo: string) => void;
  totalAmount: number;
  totalItems: number;
}

const defaultCart: Cart = {
  items: [],
  type: OrderType.DELIVERY
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : defaultCart;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );

  const totalItems = cart.items.reduce(
    (sum, item) => sum + item.quantity, 
    0
  );

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        cartItem => cartItem.juiceId === item.juiceId && cartItem.size === item.size
      );

      if (existingItemIndex > -1) {
        // Item already exists, increase quantity
        const updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        toast.success('Added to cart');
        return { ...prevCart, items: updatedItems };
      } else {
        // Add new item with quantity 1
        toast.success('Added to cart');
        return {
          ...prevCart,
          items: [...prevCart.items, { ...item, quantity: 1 }]
        };
      }
    });
  };

  const removeFromCart = (juiceId: string, size: CupSize) => {
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.filter(
        item => !(item.juiceId === juiceId && item.size === size)
      )
    }));
    toast.info('Removed from cart');
  };

  const updateQuantity = (juiceId: string, size: CupSize, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(juiceId, size);
      return;
    }

    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.map(item => 
        item.juiceId === juiceId && item.size === size
          ? { ...item, quantity }
          : item
      )
    }));
  };

  const clearCart = () => {
    setCart(defaultCart);
  };

  const setOrderType = (type: OrderType) => {
    setCart(prevCart => ({ ...prevCart, type }));
  };

  const setAddressId = (addressId: string) => {
    setCart(prevCart => ({ ...prevCart, addressId }));
  };

  const setTableNo = (tableNo: string) => {
    setCart(prevCart => ({ ...prevCart, tableNo }));
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setOrderType,
      setAddressId,
      setTableNo,
      totalAmount,
      totalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

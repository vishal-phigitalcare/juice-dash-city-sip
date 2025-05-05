
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderType, CupSize, Address } from '@/types/models';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";

const sizeLabels = {
  [CupSize.SMALL]: 'Small',
  [CupSize.MEDIUM]: 'Medium',
  [CupSize.LARGE]: 'Large'
};

const Cart: React.FC = () => {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    setOrderType,
    setAddressId, 
    setTableNo,
    totalAmount 
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [tableNumber, setTableNumber] = useState<string>(cart.tableNo || '');
  
  const handleUpdateQuantity = (juiceId: string, size: CupSize, newQuantity: number) => {
    updateQuantity(juiceId, size, newQuantity);
  };
  
  const handleRemoveItem = (juiceId: string, size: CupSize) => {
    removeFromCart(juiceId, size);
  };
  
  const handleOrderTypeChange = (type: OrderType) => {
    setOrderType(type);
  };
  
  const handleAddressChange = (addressId: string) => {
    setAddressId(addressId);
  };
  
  const handleTableNumberChange = (value: string) => {
    setTableNumber(value);
    setTableNo(value);
  };
  
  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to proceed with checkout');
      navigate('/login', { state: { redirectTo: '/cart' } });
      return;
    }
    
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    if (cart.type === OrderType.DELIVERY && !cart.addressId) {
      toast.error('Please select a delivery address');
      return;
    }
    
    if (cart.type === OrderType.DINE_IN && !cart.tableNo) {
      toast.error('Please enter your table number');
      return;
    }
    
    navigate('/checkout');
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h1>
      
      {cart.items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious juices to get started!</p>
          <Button 
            onClick={() => navigate('/menu')}
            className="bg-primary-500 hover:bg-primary-600"
          >
            Browse Menu
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Cart Items</h2>
                  <div className="border-b pb-3 mb-4">
                    <div className="grid grid-cols-12 gap-2 text-sm text-gray-500">
                      <div className="col-span-6">Item</div>
                      <div className="col-span-2 text-center">Price</div>
                      <div className="col-span-3 text-center">Quantity</div>
                      <div className="col-span-1 text-right"></div>
                    </div>
                  </div>
                  
                  {cart.items.map((item) => (
                    <div key={`${item.juiceId}-${item.size}`} className="grid grid-cols-12 gap-2 items-center py-4 border-b">
                      <div className="col-span-6 flex items-center space-x-3">
                        <div className="h-16 w-16 bg-gray-200 rounded overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.juiceName} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">{item.juiceName}</h3>
                          <p className="text-sm text-gray-500">{sizeLabels[item.size]}</p>
                        </div>
                      </div>
                      
                      <div className="col-span-2 text-center">
                        <p className="font-medium">₹{item.price}</p>
                      </div>
                      
                      <div className="col-span-3 flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.juiceId, item.size, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.juiceId, item.size, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="col-span-1 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-500"
                          onClick={() => handleRemoveItem(item.juiceId, item.size)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/menu')}
                  >
                    Continue Shopping
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => clearCart()}
                  >
                    Clear Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">₹{cart.type === OrderType.DELIVERY ? 40 : 0}</span>
                  </div>
                  <div className="pt-2 border-t border-dashed">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">₹{totalAmount + (cart.type === OrderType.DELIVERY ? 40 : 0)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                    <Select
                      value={cart.type}
                      onValueChange={(value) => handleOrderTypeChange(value as OrderType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={OrderType.DELIVERY}>Delivery</SelectItem>
                        <SelectItem value={OrderType.TAKEAWAY}>Takeaway</SelectItem>
                        <SelectItem value={OrderType.DINE_IN}>Dine-in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {cart.type === OrderType.DELIVERY && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                      {user?.addresses && user.addresses.length > 0 ? (
                        <Select
                          value={cart.addressId}
                          onValueChange={handleAddressChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select address" />
                          </SelectTrigger>
                          <SelectContent>
                            {user.addresses.map((address) => (
                              <SelectItem key={address.id} value={address.id}>
                                {address.name} - {address.address}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="border rounded-md p-3 bg-gray-50">
                          <p className="text-sm text-gray-600 mb-2">No addresses found</p>
                          <Button
                            variant="link"
                            className="text-primary-600 p-0 h-auto"
                            onClick={() => navigate('/profile/addresses')}
                          >
                            Add a new address
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {cart.type === OrderType.DINE_IN && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                      <Select
                        value={tableNumber}
                        onValueChange={handleTableNumberChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select table number" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              Table {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-primary-500 hover:bg-primary-600 py-6 text-lg"
                >
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

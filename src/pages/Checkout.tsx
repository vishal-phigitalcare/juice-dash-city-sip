
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { CupSize, OrderType, Order } from '@/types/models';
import { createOrder, processPayment } from '@/services/api';
import { toast } from 'sonner';
import { CheckCircle, MapPin, ShoppingBag, Clock } from 'lucide-react';

const sizeLabels = {
  [CupSize.SMALL]: 'Small',
  [CupSize.MEDIUM]: 'Medium',
  [CupSize.LARGE]: 'Large'
};

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { cart, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [order, setOrder] = useState<Order | null>(null);
  
  const selectedAddress = user?.addresses.find(addr => addr.id === cart.addressId);
  
  // Redirect to login if not logged in
  if (!user) {
    navigate('/login', { state: { redirectTo: '/checkout' } });
    return null;
  }
  
  // Redirect to cart if cart is empty
  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }
  
  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      
      // Process payment
      const paymentResponse = await processPayment(totalAmount + (cart.type === OrderType.DELIVERY ? 40 : 0));
      
      if (!paymentResponse.success) {
        toast.error('Payment failed. Please try again.');
        return;
      }
      
      // Create order
      const newOrder = await createOrder(
        user.id,
        cart,
        cart.type === OrderType.DELIVERY ? selectedAddress : undefined
      );
      
      // Clear cart
      clearCart();
      
      // Show success
      setOrder(newOrder);
      toast.success('Order placed successfully!');
      
    } catch (error) {
      toast.error('Failed to place order: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  if (order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="text-primary-500 h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Order Confirmed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Thank you for your order. We've received your payment and your order is being processed.
              </p>
              
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="font-medium">{order.id}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="font-medium">₹{order.totalAmount}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mt-6">
                <div className="flex items-start space-x-3 mb-4">
                  {order.orderType === OrderType.DELIVERY && (
                    <MapPin className="h-5 w-5 text-primary-500 mt-0.5" />
                  )}
                  {order.orderType === OrderType.TAKEAWAY && (
                    <ShoppingBag className="h-5 w-5 text-primary-500 mt-0.5" />
                  )}
                  {order.orderType === OrderType.DINE_IN && (
                    <Clock className="h-5 w-5 text-primary-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">
                      {order.orderType === OrderType.DELIVERY ? 'Delivery' : 
                       order.orderType === OrderType.TAKEAWAY ? 'Takeaway' : 'Dine-in'}
                    </p>
                    {order.orderType === OrderType.DELIVERY && order.address && (
                      <p className="text-sm text-gray-600 mt-1">
                        {order.address.address}, {order.address.city}
                      </p>
                    )}
                    {order.orderType === OrderType.DINE_IN && order.tableNo && (
                      <p className="text-sm text-gray-600 mt-1">
                        Table {order.tableNo}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="mb-1">Estimated time:</p>
                  <p className="font-medium text-gray-800">
                    {order.orderType === OrderType.DELIVERY 
                      ? '30-45 minutes' 
                      : order.orderType === OrderType.TAKEAWAY 
                        ? '15-20 minutes' 
                        : '10-15 minutes'}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full space-y-3">
                <Button
                  onClick={() => navigate('/orders')}
                  className="w-full bg-primary-500 hover:bg-primary-600"
                >
                  Track Order
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/menu')}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.items.map((item) => (
                <div key={`${item.juiceId}-${item.size}`} className="flex justify-between items-center py-3 border-b last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gray-200 rounded overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.juiceName} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {item.juiceName} ({sizeLabels[item.size]})
                      </h3>
                      <p className="text-sm text-gray-500">₹{item.price} × {item.quantity}</p>
                    </div>
                  </div>
                  <div className="font-medium">₹{item.price * item.quantity}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Delivery / Pickup Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {cart.type === OrderType.DELIVERY ? 'Delivery' : 
                 cart.type === OrderType.TAKEAWAY ? 'Takeaway' : 'Dine-in'} Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.type === OrderType.DELIVERY && selectedAddress && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary-500 mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">{selectedAddress.name}</p>
                      <p className="text-gray-600 mt-1">{selectedAddress.address}</p>
                      <p className="text-gray-600">{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                      <p className="text-gray-600 mt-1">Phone: {selectedAddress.phone}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {cart.type === OrderType.TAKEAWAY && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <ShoppingBag className="h-5 w-5 text-primary-500 mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Pickup from Store</p>
                      <p className="text-gray-600 mt-1">123 Juice Street, City Center</p>
                      <p className="text-gray-600 mt-1">Your order will be ready in 15-20 minutes</p>
                    </div>
                  </div>
                </div>
              )}
              
              {cart.type === OrderType.DINE_IN && cart.tableNo && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-primary-500 mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Table {cart.tableNo}</p>
                      <p className="text-gray-600 mt-1">Your order will be served in 10-15 minutes</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as 'card' | 'upi')}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center cursor-pointer">
                    <div className="ml-2">
                      <p className="font-medium">Credit/Debit Card</p>
                      <p className="text-sm text-gray-500">Pay securely with your card</p>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="flex items-center cursor-pointer">
                    <div className="ml-2">
                      <p className="font-medium">UPI</p>
                      <p className="text-sm text-gray-500">Pay using UPI</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  All transactions are processed securely through Razorpay. 
                  Your payment information is not stored on our servers.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">₹{cart.type === OrderType.DELIVERY ? 40 : 0}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">₹{totalAmount + (cart.type === OrderType.DELIVERY ? 40 : 0)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handlePlaceOrder}
                className="w-full bg-primary-500 hover:bg-primary-600 py-6 text-lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </span>
                ) : (
                  'Place Order & Pay'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

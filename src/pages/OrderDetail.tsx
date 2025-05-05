
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Order, OrderStatus, OrderType, CupSize } from '@/types/models';
import { getOrderById } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { MapPin, ShoppingBag, Clock, Home, Check, Package, Truck, Coffee, X } from 'lucide-react';

const sizeLabels = {
  [CupSize.SMALL]: 'Small',
  [CupSize.MEDIUM]: 'Medium',
  [CupSize.LARGE]: 'Large'
};

type StatusStep = {
  status: OrderStatus;
  label: string;
  icon: React.ReactNode;
  time?: string;
};

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Redirect to login if not logged in
  if (!user) {
    navigate('/login', { state: { redirectTo: `/orders/${id}` } });
    return null;
  }
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const orderData = await getOrderById(id);
        
        if (orderData) {
          setOrder(orderData);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);
  
  const getStatusSteps = (orderType: OrderType, status: OrderStatus): StatusStep[] => {
    if (orderType === OrderType.DELIVERY) {
      return [
        { status: OrderStatus.PLACED, label: 'Order Placed', icon: <Package className="h-5 w-5" /> },
        { status: OrderStatus.CONFIRMED, label: 'Order Confirmed', icon: <Check className="h-5 w-5" /> },
        { status: OrderStatus.PREPARING, label: 'Preparing', icon: <Coffee className="h-5 w-5" /> },
        { status: OrderStatus.READY, label: 'Ready for Delivery', icon: <ShoppingBag className="h-5 w-5" /> },
        { status: OrderStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery', icon: <Truck className="h-5 w-5" /> },
        { status: OrderStatus.DELIVERED, label: 'Delivered', icon: <Home className="h-5 w-5" /> }
      ];
    } else if (orderType === OrderType.TAKEAWAY) {
      return [
        { status: OrderStatus.PLACED, label: 'Order Placed', icon: <Package className="h-5 w-5" /> },
        { status: OrderStatus.CONFIRMED, label: 'Order Confirmed', icon: <Check className="h-5 w-5" /> },
        { status: OrderStatus.PREPARING, label: 'Preparing', icon: <Coffee className="h-5 w-5" /> },
        { status: OrderStatus.READY, label: 'Ready for Pickup', icon: <ShoppingBag className="h-5 w-5" /> },
        { status: OrderStatus.COMPLETED, label: 'Completed', icon: <Check className="h-5 w-5" /> }
      ];
    } else {
      return [
        { status: OrderStatus.PLACED, label: 'Order Placed', icon: <Package className="h-5 w-5" /> },
        { status: OrderStatus.CONFIRMED, label: 'Order Confirmed', icon: <Check className="h-5 w-5" /> },
        { status: OrderStatus.PREPARING, label: 'Preparing', icon: <Coffee className="h-5 w-5" /> },
        { status: OrderStatus.READY, label: 'Served', icon: <ShoppingBag className="h-5 w-5" /> },
        { status: OrderStatus.COMPLETED, label: 'Completed', icon: <Check className="h-5 w-5" /> }
      ];
    }
  };
  
  const getCurrentStatusIndex = (steps: StatusStep[], currentStatus: OrderStatus): number => {
    if (currentStatus === OrderStatus.CANCELLED) return -1;
    
    return steps.findIndex(step => step.status === currentStatus);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
        <p className="text-gray-600 mb-8">The order you're looking for doesn't exist or you don't have access to it.</p>
        <Button 
          onClick={() => navigate('/orders')}
          className="bg-primary-500 hover:bg-primary-600"
        >
          Back to Orders
        </Button>
      </div>
    );
  }
  
  const statusSteps = getStatusSteps(order.orderType, order.status);
  const currentStatusIndex = getCurrentStatusIndex(statusSteps, order.status);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/orders')}
          className="text-gray-600"
        >
          Back to Orders
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader className="bg-gray-50 py-4">
              <div className="flex flex-wrap justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order #{order.id.slice(-8)}</p>
                  <CardTitle className="text-lg">Order Status</CardTitle>
                </div>
                <Badge className={`
                  ${order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-800' : 
                    [OrderStatus.DELIVERED, OrderStatus.COMPLETED].includes(order.status) ? 
                    'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                `}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {order.status === OrderStatus.CANCELLED ? (
                <div className="bg-red-50 p-4 rounded-lg text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="text-red-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-800">Order Cancelled</h3>
                  <p className="text-red-600">
                    This order has been cancelled. Please contact support if you need assistance.
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200"></div>
                  <div className="space-y-8">
                    {statusSteps.map((step, index) => {
                      const isActive = index <= currentStatusIndex;
                      const isCurrentStep = index === currentStatusIndex;
                      
                      return (
                        <div key={step.status} className="relative flex items-start">
                          <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center z-10
                            ${isActive ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}
                            ${isCurrentStep ? 'ring-4 ring-primary-100' : ''}
                          `}>
                            {step.icon}
                          </div>
                          <div className="ml-4">
                            <h3 className={`font-medium ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>
                              {step.label}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {isActive ? (
                                `${isCurrentStep ? 'Current status' : 'Completed'}`
                              ) : (
                                'Pending'
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Order Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Time</p>
                    <p className="font-medium">{new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Type</p>
                    <div className="flex items-center mt-1">
                      {order.orderType === OrderType.DELIVERY && <MapPin className="h-4 w-4 mr-1 text-primary-500" />}
                      {order.orderType === OrderType.TAKEAWAY && <ShoppingBag className="h-4 w-4 mr-1 text-primary-500" />}
                      {order.orderType === OrderType.DINE_IN && <Clock className="h-4 w-4 mr-1 text-primary-500" />}
                      <p className="font-medium capitalize">{order.orderType.replace('_', '-')}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment ID</p>
                    <p className="font-medium">{order.paymentId || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {order.orderType === OrderType.DELIVERY && order.address && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Delivery Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-800">{order.address.name}</p>
                    <p className="text-gray-600 mt-1">{order.address.address}</p>
                    <p className="text-gray-600">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                    <p className="text-gray-600 mt-1">Phone: {order.address.phone}</p>
                  </div>
                </div>
              )}
              
              {order.orderType === OrderType.DINE_IN && order.tableNo && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Table Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-800">Table {order.tableNo}</p>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gray-200 rounded overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.juiceName} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.juiceName}</p>
                          <p className="text-sm text-gray-500">
                            {sizeLabels[item.size]} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{
                  order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                }</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">₹{order.orderType === OrderType.DELIVERY ? 40 : 0}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">₹{order.totalAmount}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => {
                  // Clone order to cart logic would go here
                  navigate('/menu');
                }}
                className="w-full bg-primary-500 hover:bg-primary-600"
              >
                Order Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
